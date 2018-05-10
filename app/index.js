// NPM module for GitHub Api
const octokit = require('@octokit/rest')();

// NPM module(Node internal) for file reading & writing operations
const fs = require('fs');

// NPM module for easy to use utility functions of String, Array
// const _ = require('lodash');

// NPM module for HTTP request
const axios = require('axios');

// const readline=require('readline');

const pipeKeywords = require('./keywords');

const CONSTANTS = {
    JENKINS_SAMPLE: './jenksinsfile_samples.json',
    JENKINSFILE_LOCATION_PREPEND: './Jenkinsfiles/',
    JENKINS_FILE_INFO_WITH_REPO:'./data/JenkinsFileDataGit.json'
}

// Github Personal Access Token. Only Read access to public repos is provided with this token.
const accessToken = '76a1e4c56ede658b7bd1241ccfb51d6c5511f289';
// Token setup for Octokit to increase the read limit to 5000 requests every hour.
octokit.authenticate({
    type: 'token',
    token: accessToken
})

/**
 * This generates the JS object with the search parameters(q), sorting parameter(sort), 
 * ordering of result(order), page number of result(page), and no of requests per page(per_page).
 * This object is the input for octokit.search.repos.
 * 
 * @param {*} page_no page number of the search query to be considered for finding the repos
 */
function getParams(page_no) {
    // Search Java language projects with MIT license
    let q_param = "Jenkinsfile in:path agent in:file language:Groovy";
    // let q_param = "mock language:java license:mit";
    // Sort by the stars of the Github project
    let sort_param = 'stars';
    // Order in descending order
    let order_param = 'desc';
    // Get 5 projects from this page
    let per_page_number = 5;

    return params = {
        q: q_param,
        // sort: sort_param,
        order: order_param,
        page: page_no,
        per_page: per_page_number
    }
};

/**
 * Async function to fetch the repo data based on the input provided by getParams().
 * Uses octokit.search.repos to fetch the required repositories.
 * Await is used to wait till the repo result is available. 
 * Once available then only fetch the pull requests data of each repo.
 */
async function startProcess() {
    try {
        // Make a HTTP call to fetch the Repo details using Octokit Git Api. 
        // Wait till the data is available.
        const result_data = await octokit.search.code(getParams(1));
        console.log('after startProcess()');


        //Once all the data is received, get the pull request data for each repo using pulls_url attribute.
        //await getPullRequestsForRepos(result_data);

        writeToFile(result_data);
        
    }
    catch (e) {
        console.log(e);
    }
}

function writeToFile(object){
    fs.writeFileSync(CONSTANTS.JENKINS_FILE_INFO_WITH_REPO,JSON.stringify(object,undefined,2));
}






// function startProcess() {
//     var jenkinsFileArray = JSON.parse(fs.readFileSync(CONSTANTS.JENKINS_SAMPLE, 'utf8'));
//     jenkinsFileArray.map(readFileWrapper());
//     // console.log(jenkinsFileArray);
// }

// function readFileWrapper() {
//     return async function readFile(eachJenkinsFile) {

//         let lineReader=readline.createInterface({
//             input: fs.createReadStream(CONSTANTS.JENKINSFILE_LOCATION_PREPEND + eachJenkinsFile.localName)
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

//         // fs.readFile(CONSTANTS.JENKINSFILE_LOCATION_PREPEND + eachJenkinsFile.localName, 'utf8', function (err, contents) {
//         //     console.log(contents);

//         // });

//     }
// }

module.exports = {
    startProcess
}