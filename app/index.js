var request = require('request');

// NPM module for GitHub Api
const octokit = require('@octokit/rest')();

// NPM module(Node internal) for file reading & writing operations
const fs = require('fs');

// NPM module for easy to use utility functions of String, Array
// const _ = require('lodash');

// NPM module for HTTP request
const axios = require('axios');
// axios.defaults.headers.common['Authorization']='Basic YWRtaW46MTIzNDU2Nzg5';
// axios.defaults.withCredentials=true;
// const readline=require('readline');

const pipeKeywords = require('./keywords');

const Q1 =
    'What are the most frequent post-condition blocks in the post section within jenkins pipelines? Create distribution graphs for post-condition blocks.';

var parsedJenkinsFile = [];
var parseBasedOnOutput =
    {research_question_1: Q1, counts_of_post_elements: {}, project_details: []}

const POST_ELEMENTS_CONSTANTS = {
  ALWAYS: 'always',
  CHANGED: 'changed',
  FIXED: 'fixed',
  REGRESSION: 'regression',
  ABORTED: 'aborted',
  FAILURE: 'failure',
  SUCCESS: 'success',
  UNSTABLE: 'unstable',
  CLEANUP: 'cleanup'
}

const CONSTANTS = {
  JENKINS_SAMPLE: './jenksinsfile_samples.json',
  JENKINSFILE_LOCATION_PREPEND: './Jenkinsfiles/',
  JENKINS_FILE_INFO_WITH_REPO: './data/JenkinsFileDataGit.json'
}

const SEARCH_CODE_GIT_CONSTANTS = {
  REPOS_PER_PAGE: 15,
  MAX_NO_OF_PAGES_TO_FETCH_FROM: 2
}

// Github Personal Access Token. Only Read access to public repos is provided
// with this token.
const accessToken = '76a1e4c56ede658b7bd1241ccfb51d6c5511f289';
// Token setup for Octokit to increase the read limit to 5000 requests every
// hour.
octokit.authenticate({type: 'token', token: accessToken})

/**
 * This generates the JS object with the search parameters(q), sorting
 * parameter(sort), ordering of result(order), page number of result(page), and
 * no of requests per page(per_page). This object is the input for
 * octokit.search.repos.
 *
 * @param {*} page_no page number of the search query to be considered for finding the repos
 */
function getParams(page_no) {
  // Search Java language projects with MIT license
  let q_param = 'Jenkinsfile in:path agent post in:file language:Groovy';
  // let q_param = "mock language:java license:mit";
  // Sort by the stars of the Github project
  let sort_param = 'stars';
  // Order in descending order
  let order_param = 'desc';
  // Get 5 projects from this page
  let per_page_number = SEARCH_CODE_GIT_CONSTANTS.REPOS_PER_PAGE;

  return params = {
    q: q_param,
    // sort: sort_param,
    order: order_param,
    // page: page_no,
    per_page: per_page_number
  }
};

/**
 * Async function to fetch the repo data based on the input provided by
 * getParams(). Uses octokit.search.repos to fetch the required repositories.
 * Await is used to wait till the repo result is available.
 * Once available then only fetch the pull requests data of each repo.
 */
async function startProcess() {
  try {
    // Make a HTTP call to fetch the Repo details using Octokit Git Api.
    // Wait till the data is available.
    let result_data = await paginateSearchCalls();
    console.log('after startProcess()');

    let promises = result_data.map(getEachJenkinsFileWrapper());
    await Promise.all(promises);

    promises = parsedJenkinsFile.map(eachParsedJenkinsFileWrapper());
    await Promise.all(promises);

    writeToFile();

  } catch (e) {
    console.log(e);
  }
}

function eachParsedJenkinsFileWrapper() {
  return async function(eachFile) {
    parseBasedOnOutput.project_details.push(eachFile);

    if (eachFile.jenkins_pipeline && eachFile.jenkins_pipeline.pipeline &&
        eachFile.jenkins_pipeline.pipeline.post) {
      let promises = eachFile.jenkins_pipeline.pipeline.post.conditions.map(
          processEachConditionBlock());
      await Promise.all(promises);
    }
  }
}

function processEachConditionBlock() {
  return async function(eachConditionObj) {
    switch (eachConditionObj.condition.toLowerCase()) {
      case POST_ELEMENTS_CONSTANTS.ALWAYS:
        incrementCount(POST_ELEMENTS_CONSTANTS.ALWAYS);
        break;
      case POST_ELEMENTS_CONSTANTS.CHANGED:
        incrementCount(POST_ELEMENTS_CONSTANTS.CHANGED);
        break;
      case POST_ELEMENTS_CONSTANTS.FIXED:
        incrementCount(POST_ELEMENTS_CONSTANTS.FIXED);
        break;
      case POST_ELEMENTS_CONSTANTS.REGRESSION:
        incrementCount(POST_ELEMENTS_CONSTANTS.REGRESSION);
        break;
      case POST_ELEMENTS_CONSTANTS.ABORTED:
        incrementCount(POST_ELEMENTS_CONSTANTS.ABORTED);
        break;
      case POST_ELEMENTS_CONSTANTS.FAILURE:
        incrementCount(POST_ELEMENTS_CONSTANTS.FAILURE);
        break;
      case POST_ELEMENTS_CONSTANTS.SUCCESS:
        incrementCount(POST_ELEMENTS_CONSTANTS.SUCCESS);
        break;
      case POST_ELEMENTS_CONSTANTS.UNSTABLE:
        incrementCount(POST_ELEMENTS_CONSTANTS.UNSTABLE);
        break;
      case POST_ELEMENTS_CONSTANTS.CLEANUP:
        incrementCount(POST_ELEMENTS_CONSTANTS.CLEANUP);
        break;
    }
  }
}

function incrementCount(element) {
  let count = parseBasedOnOutput.counts_of_post_elements[element];
  if (count) {
    count++;
  } else {
    count = 1;
  }
  parseBasedOnOutput.counts_of_post_elements[element] = count;
}

function getEachJenkinsFileWrapper() {
  return async function(eachRepoForFile) {
    try {
      let myJsonStructure = {};
      let response = await axios.get(
          eachRepoForFile.git_url + '?access_token=' + accessToken);
      //   console.log(eachRepoForFile.repository.name + ':' +
      //   response.data.content);
      let fileContent = Buffer.from(response.data.content, 'base64');
      //   console.log(
      //       eachRepoForFile.repository.name + ':' +
      //       fileContent.toString('ascii'));

      //   let response_jenkins = await axios.post(
      //       'http://docker:9080/pipeline-model-converter/toJson',
      //       {formData:{'jenkinsfile': fileContent.toString('ascii')}}, {
      //         withCredentials: true,
      //         auth: {username: 'admin', password: '123456789'}
      //       });
      //   console.log(response_jenkins.data.data.errors);
      let jsonResponse = await jenkinsJSONPromise(fileContent);
      myJsonStructure['full_repo_name'] = eachRepoForFile.repository.full_name;
      myJsonStructure['repo_url'] = eachRepoForFile.repository.html_url;
      myJsonStructure['html_url_jenkinsfile'] = eachRepoForFile.html_url;
      myJsonStructure['api_url_jenkinsfile'] = eachRepoForFile.git_url;
      myJsonStructure['jenkins_pipeline'] = jsonResponse;
      //   console.log('jsonResponse:' + jsonResponse);
      parsedJenkinsFile.push(myJsonStructure);



      // console.log(response);
    } catch (e) {
      console.log(e);
    }
  }
}

function jenkinsJSONPromise(fileContent) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: 'http://192.168.99.100:9080/pipeline-model-converter/toJson',
      headers: {
        //   'postman-token': '73d0face-581b-c6f5-984a-bfeb8e37a9a4',
        'cache-control': 'no-cache',
        authorization: 'Basic YWRtaW46MTIzNDU2Nzg5',
        'content-type':
            'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      },
      formData: {jenkinsfile: fileContent}
    };

    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        reject(error);
        return;
      };
      if (JSON.parse(body).data.json) {
        resolve(JSON.parse(body).data.json);
      } else if (JSON.parse(body).data) {
        resolve(JSON.parse(body).data.errors);
      }
      //   console.log(JSON.stringify(JSON.parse(body).data.json, undefined,
      //   2));
      // parsedJenkinsFile.push(JSON.parse(body));
    });
  });
}

function writeToFile() {
  console.log('File writing started.');
  fs.writeFileSync(
      CONSTANTS.JENKINS_FILE_INFO_WITH_REPO,
      JSON.stringify(parseBasedOnOutput, undefined, 2));
}

async function paginateSearchCalls() {
  let count_of_pages = SEARCH_CODE_GIT_CONSTANTS.MAX_NO_OF_PAGES_TO_FETCH_FROM;
  let response = await octokit.search.code(getParams(1));
  let data = [];
  data = data.concat(response.data.items);
  while (count_of_pages > 1 && octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response);
    data = data.concat(response.data.items);
    count_of_pages--;
  }
  return data;
}



// function startProcess() {
//     var jenkinsFileArray =
//     JSON.parse(fs.readFileSync(CONSTANTS.JENKINS_SAMPLE, 'utf8'));
//     jenkinsFileArray.map(readFileWrapper());
//     // console.log(jenkinsFileArray);
// }

// function readFileWrapper() {
//     return async function readFile(eachJenkinsFile) {

//         let lineReader=readline.createInterface({
//             input: fs.createReadStream(CONSTANTS.JENKINSFILE_LOCATION_PREPEND
//             + eachJenkinsFile.localName)
//         });
//         lineReader.on('line',(line)=>{

//             if(!line){
//                 return;
//             }

//             console.log(eachJenkinsFile.localName+":"+line);
//             var pattern=/\s*([a-zA-Z]*)\s*{\s*|\s*([a-zA-Z]*)}\s*/;
//             let tokens=line.split(pattern);
//             console.log(tokens);

//         });

//         // fs.readFile(CONSTANTS.JENKINSFILE_LOCATION_PREPEND +
//         eachJenkinsFile.localName, 'utf8', function (err, contents) {
//         //     console.log(contents);

//         // });

//     }
// }

module.exports = {startProcess}