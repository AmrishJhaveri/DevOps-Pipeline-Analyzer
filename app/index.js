const pipeKeywords = require('./keywords');

const fs = require('fs');

const CONSTANTS = {
    JENKINS_SAMPLE: './jenksinsfile_samples.json',
    JENKINSFILE_LOCATION_PREPEND: './Jenkinsfiles/'
}

function startProcess() {
    var jenkinsFileArray = JSON.parse(fs.readFileSync(CONSTANTS.JENKINS_SAMPLE, 'utf8'));
    jenkinsFileArray.map(readFileWrapper());
    console.log(jenkinsFileArray);
}

function readFileWrapper() {
    return async function readFile(eachJenkinsFile) {

        await fs.readFile(CONSTANTS.JENKINSFILE_LOCATION_PREPEND + eachJenkinsFile.localName, 'utf8', function (err, contents) {
            console.log(contents);

        });

    }
}

startProcess();