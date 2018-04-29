const fs = require('fs');
const readline=require('readline');

const pipeKeywords = require('./keywords');





const CONSTANTS = {
    JENKINS_SAMPLE: './jenksinsfile_samples.json',
    JENKINSFILE_LOCATION_PREPEND: './Jenkinsfiles/'
}

function startProcess() {
    var jenkinsFileArray = JSON.parse(fs.readFileSync(CONSTANTS.JENKINS_SAMPLE, 'utf8'));
    jenkinsFileArray.map(readFileWrapper());
    // console.log(jenkinsFileArray);
}

function readFileWrapper() {
    return async function readFile(eachJenkinsFile) {

        let lineReader=readline.createInterface({
            input: fs.createReadStream(CONSTANTS.JENKINSFILE_LOCATION_PREPEND + eachJenkinsFile.localName)
        });
        lineReader.on('line',(line)=>{

            if(!line){
                return;
            }

            console.log(eachJenkinsFile.localName+":"+line);
            var pattern=/\s*([a-zA-Z]*)\s*{\s*|\s*([a-zA-Z]*)}\s*/;
            let tokens=line.split(pattern);
            console.log(tokens);

        });

        // fs.readFile(CONSTANTS.JENKINSFILE_LOCATION_PREPEND + eachJenkinsFile.localName, 'utf8', function (err, contents) {
        //     console.log(contents);

        // });

    }
}

module.exports = {
    startProcess
}