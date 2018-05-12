// NPM module for HTTP requests
var request = require('request');

// NPM module for GitHub Api
const octokit = require('@octokit/rest')();

// NPM module(Node internal) for file reading & writing operations
const fs = require('fs');

// NPM module for HTTP request
const axios = require('axios');


// Global object which will contain all the jenkinsfile parsed in a JSON format
var parsedJenkinsFile = [];

// Global Object which will store the data for the required question and print
// it in a JSON file.
var parseBasedOnOutput = {
  // Research question
  research_question_2:
      'How is the presence of triggers in a pipeline correlates with the number of stages in the pipeline? What are the common types of triggers used in pipelines',
  // to be added to final json output file by th python script
  corelation_coefficient: 'to_be_calculated_by_python_script',
  // counts of different triggers present in the triggers section.
  counts_of_types_of_triggers: {},
  // a list of no. of triggers and stages for each jenkisnfile.
  counts_of_triggers_and_stages: [],
  // List of Jenkinsfile's Project and the parsed JSON output of the
  // jenkinsfile.
  project_details: []
}

// Constants for file locations of output
const CONSTANTS = {
  // This will contain the final output in JSON form.
  JENKINS_FILE_INFO_WITH_REPO: './finalOutput.json',
  // This file will be used by Python script to generate grpah for Q1.a
  INTERMEDIATE_OUTPUT_FOR_PYTHON: './intermediateOutput.json'
}

// Configuration which can be changed for fetching more files from GITHUB.
// Recursive calls to Jenkins Server can be configured here but can go into
// infinelty loop.
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

// IP address and port number on which local Jenkins Server deployed on docker
// is available.
const JENKINS_SERVER = {
  IP: '192.168.99.100',
  PORT: '9080',
  // this is basic authroization encoded data for username and password.
  // if username and password changed from admin and provided password than
  // change this.
  BASIC_AUTHORIZATION: 'Basic YWRtaW46MTIzNDU2Nzg5'
}


/**
 * This generates the JS object with the search parameters(q), sorting
 * parameter(sort), ordering of result(order), page number of result(page), and
 * no of requests per page(per_page). This object is the input for
 * octokit.search.repos.
 *
 * @param {*} page_no page number of the search query to be considered for finding the repos
 */
function getParams(page_no) {
  // Search Jenkinsfile with agent, stages and triggers keywords in the file,
  // written in Groovy.
  let q_param =
      'Jenkinsfile in:path agent stages triggers in:file language:Groovy';
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
 * Async function to fetch the jenkinsfile data based on the input provided by
 * getParams(). Uses octokit.search.code to fetch the required metadata of the
 * files. Await is used to wait till the results is available. Once available
 * then only fetch the data in the jenkinsfile of each repo. Get JSON
 * representation of the jenkinsfile by making a HTTP call to pipeline-module
 * api of Jenkins deployed on docker. Iterate the JSON to get the result of the
 * analysis.
 */
async function startProcess() {
  try {
    // Make a HTTP call to fetch the Repo details using Octokit Git Api.
    // Wait till the data is available.
    let result_data = await paginateSearchCalls();
    console.log('after paginateSearchCalls()');

    // Getting JSON representation of the Jenkinsfile by sending a HTTP request
    // to a jenkinsci/pipeline-model-definition-plugin
    let promises = result_data.map(getEachJenkinsFileWrapper());
    await Promise.all(promises);
    console.log('after all getEachJenkinsFileWrapper()');

    // Parse the JSON jenkinsfile structure to answer the researhc question
    promises = parsedJenkinsFile.map(eachParsedJenkinsFileWrapper());
    await Promise.all(promises);
    console.log('after all eachParsedJenkinsFileWrapper()');

    // write the different results in the global data structure to the files
    writeToFile();
    writeIntermediateFile();

  } catch (e) {
    console.log('Error in startProcess()', e);
  }
}

/**
 * This function is a wrapper around the async function which takes JSON
 * representation of the jenkinsfile as input. Checks for valid pipeline present
 * in the JSON with a Stage and/or Trigger section.
 *
 */
function eachParsedJenkinsFileWrapper() {
  return async function(eachFile) {
    // Add to the global object
    parseBasedOnOutput.project_details.push(eachFile);
    // keepign track of counts for stages and triggers
    let count_stages = 0, count_triggers = 0;
    let validFlag = false;
    // checks for valid pipeline and stages and stores its length.
    if (eachFile.jenkins_pipeline && eachFile.jenkins_pipeline.pipeline &&
        eachFile.jenkins_pipeline.pipeline.stages) {
      count_stages = eachFile.jenkins_pipeline.pipeline.stages.length;
      validFlag = true;
    }
    // checks for valid pipeline and triggers and stores its length
    if (eachFile.jenkins_pipeline && eachFile.jenkins_pipeline.pipeline &&
        eachFile.jenkins_pipeline.pipeline.triggers &&
        eachFile.jenkins_pipeline.pipeline.triggers.triggers) {
      count_triggers =
          eachFile.jenkins_pipeline.pipeline.triggers.triggers.length;
      // iterates over each trigger found to count the the frequency.
      let promises = eachFile.jenkins_pipeline.pipeline.triggers.triggers.map(
          processEachTrigger());
      await Promise.all(promises);
      validFlag = true;
    }
    if (validFlag) {
      // if stages and/or triggers are valid section then create the object with
      // counts and store in a global object
      parseBasedOnOutput.counts_of_triggers_and_stages.push(
          {'triggers': count_triggers, 'stages': count_stages});
    }
  }
}

/**
 * This function is calculating the counts for each type of trigger found in the
 * triggers section.
 */
function processEachTrigger() {
  return async function(eachStageObj) {
    let triggerName = eachStageObj.name.toLowerCase();
    let count = parseBasedOnOutput.counts_of_types_of_triggers[triggerName];
    if (!parseBasedOnOutput.counts_of_types_of_triggers[triggerName]) {
      parseBasedOnOutput.counts_of_types_of_triggers[triggerName] = 1;
    } else {
      parseBasedOnOutput.counts_of_types_of_triggers[triggerName] = count + 1;
    }
  }
}

/**
 * This function is a wrapper function for the async function which is mainly
 * responsible for creating a object which will be added to the global object
 * parsedJenkinsFile.
 *
 * First we get the data for the jenkinsfile blob from github.
 * Decode this base64 encoded data and pass it to Jenkins API on the jenkins
 * server to receive JSON representation.
 * We retrive the required data and create our own object which
 * will be added to the global object.
 *
 */
function getEachJenkinsFileWrapper() {
    return async function(eachRepoForFile) {
      try {
        let myJsonStructure = {};
        // Getting the blob details of the Jenkinsfile.
        let response = await axios.get(
            eachRepoForFile.git_url + '?access_token=' + accessToken);
  
        // decode the content part of the reponse
        let fileContent = Buffer.from(response.data.content, 'base64');
        let jsonResponse;
  
        try {
          // this can throw an error because of bottleneck on Jenkins side. Tried
          // to resolve by recursive calls but not a foolproof solution.
          jsonResponse = await jenkinsJSONPromise(fileContent);
          myJsonStructure['full_repo_name'] =
              eachRepoForFile.repository.full_name;
          myJsonStructure['repo_url'] = eachRepoForFile.repository.html_url;
          myJsonStructure['html_url_jenkinsfile'] = eachRepoForFile.html_url;
          myJsonStructure['api_url_jenkinsfile'] = eachRepoForFile.git_url;
          myJsonStructure['jenkins_pipeline'] = jsonResponse;
  
          parsedJenkinsFile.push(myJsonStructure);
  
        } catch (e) {
          // Absorbing this error. Since bottleneck on Jenkins side.
        }
  
      } catch (e) {
        console.log('Error at getEachJenkinsFileWrapper()', e);
      }
    }
  }

/**
 * This function returns a promise.
 * The call to the Jenkins pipeline-model-converter API on the local Jenkins
 * server is made which will return a JSON response, if successful. We are
 * making recursive calls because of bottleneck on Jenkins. The jenkinsfile is
 * provided as a multi-part form data to the api. We make limited recursive
 * calls, restricted by the value of
 * SEARCH_CODE_GIT_CONSTANTS.RECURSIVE_CALLS_TO_JENKINS.
 *
 * @param {*} fileContent
 */
function jenkinsJSONPromise(fileContent) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'POST',
        url: 'http://' + JENKINS_SERVER.IP + ':' + JENKINS_SERVER.PORT +
            '/pipeline-model-converter/toJson',
        headers: {
          'cache-control': 'no-cache',
          authorization: JENKINS_SERVER.BASIC_AUTHORIZATION,
          'content-type':
              'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
          'Connection': 'keep-alive'
        },
        formData: {jenkinsfile: fileContent}
      };
  
      let count = 0;
  
      // first call made inside this recursive function.
      recursiveRequest(resolve, reject, options, count);
    });
  }

/**
 * This function is recursive so we can imrpove on the bottleneck issue faced on
 * the Jenkins end. We check if the result is valid, if so, then resolve the
 * promise. If not valid then check the error code and make the call again.
 * Recursive calls is limited by the parameter
 * SEARCH_CODE_GIT_CONSTANTS.RECURSIVE_CALLS_TO_JENKINS, so to avoid infinite
 * loop.
 *
 *
 * @param {*} resolve If successful then use this to resolve the Promise and provide the response.
 * @param {*} reject If unsuccessful then use this reject the promise and provide error object.
 * @param {*} options all confis related to the call to be made as required by NPM request module
 * @param {*} count number calls made for this jenkinsfile. So avoid infinite loop.
 */
function recursiveRequest(resolve, reject, options, count) {
    count++;
    request(options, function(error, response, body) {
      if (error) {
        // If particular type of error and count of calls is less the number
        // allowed then make the call again.
        if (count < SEARCH_CODE_GIT_CONSTANTS.RECURSIVE_CALLS_TO_JENKINS &&
            error.code === 'ECONNRESET') {
          recursiveRequest(resolve, reject, options, count);
          return;
        }
        // if above conditions not met then reject the promise.
        reject(error);
        return;
      } else if (JSON.parse(body).data.json) {
        // Valid JSON structure is present. So resolve it and provide it as
        // parameter.
        resolve(JSON.parse(body).data.json);
      } else if (JSON.parse(body).data) {
        // Jenkins file has some issue. So provide the error message in the
        // parameter.
        resolve(JSON.parse(body).data.errors);
      }
    });
  }

/**
 *  Write synchronously to the final output json file.
 */
function writeToFile() {
  console.log('File writing started.');
  fs.writeFileSync(
      CONSTANTS.JENKINS_FILE_INFO_WITH_REPO,
      JSON.stringify(parseBasedOnOutput, undefined, 2));
}

/**
 *  Write synchronously to the Intermediate file which will be used by the
 * python script.
 */
function writeIntermediateFile() {
  fs.writeFileSync(
      CONSTANTS.INTERMEDIATE_OUTPUT_FOR_PYTHON,
      JSON.stringify(
          parseBasedOnOutput.counts_of_triggers_and_stages, undefined, 2));
}

/**
 *  Async function for getting results from Github api.
 * Using octokit.search.code api for fetching the results.
 * Using pagination for retriving the required number of results mentioned in
 * SEARCH_CODE_GIT_CONSTANTS.MAX_NO_OF_PAGES_TO_FETCH_FROM
 *
 */
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
// Starting the entire process.
startProcess();
// Exporting the functions can be called from index.js
// currently not used because of GIT API restrictions for 'You have triggered an
// abuse detection mechanism.'
module.exports = {startProcess}