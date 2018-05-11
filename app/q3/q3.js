var request = require('request');

// NPM module for GitHub Api
const octokit = require('@octokit/rest')();

// NPM module(Node internal) for file reading & writing operations
const fs = require('fs');

// NPM module for HTTP request
const axios = require('axios');


var parsedJenkinsFile = [];
var parseBasedOnOutput = {
  research_question_3:
      'What are the most and the least frequent operations in pipeline stages?',
  counts_of_operation_stages: {},
  project_details: []
}

const CONSTANTS = {
  JENKINS_FILE_INFO_WITH_REPO: './app/q3/finalOutput.json',
  INTERMEDIATE_OUTPUT_FOR_PYTHON: './app/q3/intermediateOutput.json'
}

const SEARCH_CODE_GIT_CONSTANTS = {
  REPOS_PER_PAGE: 30,
  MAX_NO_OF_PAGES_TO_FETCH_FROM: 3,
  RECURSIVE_CALLS_TO_JENKINS: 2
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
  let q_param =
      'Jenkinsfile in:path agent steps size>100 in:file language:Groovy';
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
    writeIntermediateFile();

  } catch (e) {
    console.log('startProcess');
    console.log(e);
  }
}

/**
 *
 */
function eachParsedJenkinsFileWrapper() {
  return async function(eachFile) {
    parseBasedOnOutput.project_details.push(eachFile);

    if (eachFile.jenkins_pipeline && eachFile.jenkins_pipeline.pipeline &&
        eachFile.jenkins_pipeline.pipeline.stages) {
      let promises = eachFile.jenkins_pipeline.pipeline.stages.map(
          processEachStageBlock());
      await Promise.all(promises);
    }
  }
}

/**
 *
 */
function processEachStageBlock() {
  return async function(eachStageObj) {
    let stageName = eachStageObj.name.toLowerCase();
    let count = parseBasedOnOutput.counts_of_operation_stages[stageName];
    if (!parseBasedOnOutput.counts_of_operation_stages[stageName]) {
      parseBasedOnOutput.counts_of_operation_stages[stageName] = 1;
    } else {
      parseBasedOnOutput.counts_of_operation_stages[stageName] = count + 1;
    }
  }
}

/**
 *
 */
function getEachJenkinsFileWrapper() {
  return async function(eachRepoForFile) {
    try {
      let myJsonStructure = {};
      let response = await axios.get(
          eachRepoForFile.git_url + '?access_token=' + accessToken);

      let fileContent = Buffer.from(response.data.content, 'base64');
      let jsonResponse;
      try {
        jsonResponse = await jenkinsJSONPromise(fileContent);
      } catch (e) {
        // console.log('getEachJenkinsFileWrapper try');
        console.log(e);
      }


      myJsonStructure['full_repo_name'] = eachRepoForFile.repository.full_name;
      myJsonStructure['repo_url'] = eachRepoForFile.repository.html_url;
      myJsonStructure['html_url_jenkinsfile'] = eachRepoForFile.html_url;
      myJsonStructure['api_url_jenkinsfile'] = eachRepoForFile.git_url;
      //   myJsonStructure['actual_jenkinsfile']=fileContent.toString('ascii');
      myJsonStructure['jenkins_pipeline'] = jsonResponse;
      parsedJenkinsFile.push(myJsonStructure);

    } catch (e) {
      console.log('getEachJenkinsFileWrapper');
      console.log(e);
    }
  }
}

/**
 *
 * @param {*} fileContent
 */
function jenkinsJSONPromise(fileContent) {
  return new Promise((resolve, reject) => {
    let options = {
      method: 'POST',
      url: 'http://192.168.99.100:9080/pipeline-model-converter/toJson',
      headers: {
        'cache-control': 'no-cache',
        authorization: 'Basic YWRtaW46MTIzNDU2Nzg5',
        'content-type':
            'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        'Connection': 'keep-alive'
      },
      formData: {jenkinsfile: fileContent}
    };

    let count = 0;
    recursiveRequest(resolve, reject, options, count);

    // request(options, function(error, response, body) {
    //   if (error) {
    //     // console.log(error);
    //     //reject(error);
    //     console.log(JSON.stringify(error));

    //     return;
    //   };
    //   if (JSON.parse(body).data.json) {
    //     resolve(JSON.parse(body).data.json);
    //   } else if (JSON.parse(body).data) {
    //     resolve(JSON.parse(body).data.errors);
    //   }
    // });
  });
}

function recursiveRequest(resolve, reject, options, count) {
  count++;
  request(options, function(error, response, body) {
    if (error) {
      // console.log(error);
      //   console.log(JSON.stringify(error));
      if (count < SEARCH_CODE_GIT_CONSTANTS.RECURSIVE_CALLS_TO_JENKINS &&
          error.code === 'ECONNRESET') {
        recursiveRequest(resolve, reject, options, count);
        return;
      }
      reject(error);
      return;
    } else if (JSON.parse(body).data.json) {
      resolve(JSON.parse(body).data.json);
    } else if (JSON.parse(body).data) {
      resolve(JSON.parse(body).data.errors);
    }
  });
}

/**
 *
 */
function writeToFile() {
  console.log('File writing started.');
  fs.writeFileSync(
      CONSTANTS.JENKINS_FILE_INFO_WITH_REPO,
      JSON.stringify(parseBasedOnOutput, undefined, 2));
}

function writeIntermediateFile() {
  fs.writeFileSync(
      CONSTANTS.INTERMEDIATE_OUTPUT_FOR_PYTHON,
      JSON.stringify(
          parseBasedOnOutput.counts_of_operation_stages, undefined, 2));
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

module.exports = {startProcess}