
const pipeKeywords = require('./keywords');

const fs = require('fs');

//console.log(JSON.stringify(pipeKeywords.keysArray));
async function readFile() {

    await fs.readFile('./../Jenkinsfiles/Jenkinsfile_3', 'utf8', function (err, contents) {
        console.log(err);
    });

}
readFile();