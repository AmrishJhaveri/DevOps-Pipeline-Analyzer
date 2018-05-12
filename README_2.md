**Note:**	Please view this file in a web browser.

# DevOps-Pipeline-Analyzer

DevOps-Pipeline-Analyzer collects large number of DevOps pipeline programs and obtains statistical data that describe the content and patterns in DevOps pipelines.

## Getting Started

----------

### Prerequisites

- Node `v9.9.0`(NPM is installed with Node)
- Python `v3.6.1`
- Docker `v18.01.0-ce` running on `192.168.99.100` (if different then change the IP in code files).

### Installing

1. Assuming docker is running on your system. We have to install Jenkins on the docker. Open docker terminal and execute the following command:

	`docker run --detach --name jenkins -p 9080:8080 -p 50000:50000 ajhave5/jenkins:latest`
	*8080 : exposes web interface,	50000: access to remote JAVA API.*

	Open the URL `192.168.99.100:9080` . Follow the instructions of installation and install the defualt plugins(pipeline-model-definition should be there).Create a `admin` user with password `123456789`. Important that you keep the username and password same as given above since Basic Authorization is used to connect to the Jenkins Server. If asked for a key during installation then use the command:
	`docker logs jenkins` and you will find the key there and then setup the `admin` user.

2. Make sure `node` and `npm` is installed on the system. To check run the following commands from command prompt or shell: `node -v` & `npm -v`.

3. Run `npm install` from the directory where `package.json` is present.
This will install the required modules present in `package.json` into the project directory inside `node_modules` directory.

### Project Structure
Inside `app` folder various folders like `q1`,`q2`,`q3` and `q4` are present. Each represent the research questions we are answering.
Inside each such folder, a JS file, Python script and multiple JSON files will be seen.

1. JS File collects the data from Github, hits Jenkins's pipeline-model-definition API to convert each Jenkinsfile into a JSON representation, parse this JSON to answer the research question and output the results into a `finalOutput.json`.
2. Various intermediate files are created which are required for the Python Script.
3. Python Script reads the `intermediateOutput.json` and uses to calculate co-relation co-efficient or create distribution graphs as required.
4. If its a co-relation co-efficient result than its updated in the `finalOutput.json`. If graphs than they are saved to the same question folder. 

### Running the Application
- Run `npm start` will start the application and fetch the repository details and clone the repositories in the project directory. This will generate 2 JSON files.