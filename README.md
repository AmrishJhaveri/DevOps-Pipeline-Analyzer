# Empirical-Analysis-of-DevOps-Pipeline

The goal of this project is to empirically investigate a large number of devops pipeline programs and obtain statistical data that describe the content and patterns in devops pipelines. We searched and obtained Jenkinsfiles and other pipeline artifacts from open-source repositories, e.g. Github. The result of this investigation is summarized in the [Project Report](https://github.com/AmrishJhaveri/DevOps-Pipeline-Analyzer/blob/master/Project%20Report.pdf).

## Getting Started

----------

### Prerequisites

- Node `v9.9.0`(NPM is installed with Node)
- Python `v3.6.1`. Also `pip` & `pip install scipy`.
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
**Important Note-** *It is possible to run all 4 files(q1.js,q2.js,q3.js,q4.js) simultaneously, we would advice you to run them independently. If you don't than a issue 'You have triggered an abuse detection mechanism.' will arise form the Github API end.*

**Generate your own Personal Access Token-**
1. Login to Github with your credentials.
2. Navigate to Settings --> Developer Settings --> Personal Access Token
3. Generate a token whic required only access to public_repos.
4. Copy this token and provide it in the code files to 'accessToken' variable.

**Follow the below steps for each question:**

- Navigate to folder `q1`.
- Run the file `q1.js` by the command `node q1.js`. Once completed, it will create the output files as required.
- Once completed, you can run the python script in that particular folder: `python post_section.py` 
- The graph will be created.

If issue like this occur: 

    Traceback (most recent call last):
	  File "post_section.py", line 28, in <module>
	fig.savefig('post_section.jpg')
	  File "F:\Program Files\Python\Python36\lib\site-packages\matplotlib\figure.py", line 1834, in savefig
	self.canvas.print_figure(fname, **kwargs)
	  File "F:\Program Files\Python\Python36\lib\site-packages\matplotlib\backend_bases.py", line 2170, in print_figure
	canvas = self._get_output_canvas(format)
	  File "F:\Program Files\Python\Python36\lib\site-packages\matplotlib\backend_bases.py", line 2113, in _get_output_canvas
	'%s.' % (format, ', '.join(formats)))
	ValueError: Format "jpg" is not supported.
	Supported formats: eps, pdf, pgf, png, ps, raw, rgba, svg, svgz.

then execute `pip3 install pillow`.

## Architecture
----------
![](https://github.com/AmrishJhaveri/DevOps-Pipeline-Analyzer/blob/master/images/Architecture_db_add.png)

- A Jenkins Server will be running on the local Docker VM exposed via `9080` port and `192.168.99.100` IP address.
- The NodeJS application will collect the data from Github via its API and then pass the jenkinsfile to pipeline-model-definition API of Jenkins.
- Once response is received we retrieve the required data from the JSON representation of the Jenkinsfile and use the data to answer the research questions.
- Final Output is stored in JSON files in a pre-defined structure(shown later).
- IntermediateOutput JSON files are used by python scripts to create the graphs or calculate co-relation co-efficients.

## Detailed Report
----------

Please find the report of the analysis by opening the following document:

[https://github.com/AmrishJhaveri/DevOps-Pipeline-Analyzer/blob/master/Project%20Report.pdf](https://github.com/AmrishJhaveri/DevOps-Pipeline-Analyzer/blob/master/Project%20Report.pdf)

### Implementation

1. Fire query to GitHub API to search for repositories having Jenkinsfile containing the section to be analysed for the corresponding research question. Since there are huge number of results, we use pagination to process them in batches.
2. Using the API of the jenkinsci/pipeline-model-definition-plugin, we parse the Jenkinsfile (which is in Groovy) of each repo into a JSON structure. This is a plugin for Jenkins, which means to parse a Jenkinsfile, we need to first run it in Jenkins, where we make the required API calls for converting to JSON structure, which is then stored for analysis
3. We now check if the JSON structure contains the section corresponding to the research question in the desired format. This is because the JSON structure may contain errors due to improper syntaxes or a keyword not supported by the plugin. In such a case, we would not be able to use this file for our study, and hence must be neglected.
4. From the files that contain the desired section(s), we store the results i.e. counting of various fields and actions observed in the file, into a common JSON file, which would be later retrieved for analysis.
5. While the above portion has been implemented using NodeJS, we perform the actual analysis, inference and visualization using Python scripts, one for each research question. Based on the results stored in a global JSON structure as mentioned above, we plot various graphs to help understand the data distribution, and in some cases store analysis results in the common JSON.

## Flow Chart for Q1:
----------
The below image shows the flow for Q1. Flow for other questions is similar to this:

![](https://github.com/AmrishJhaveri/DevOps-Pipeline-Analyzer/blob/master/images/q1.png)

## Output Structure
----------
The actual output file is present at the location: [Q1_Final_Output](https://github.com/AmrishJhaveri/DevOps-Pipeline-Analyzer/blob/master/app/q1/finalOutput.json).
The output present in `finalOutput.json` will have the following structure :

Attribute Name|Data Type|Purpose
--|--|--
research_question_1a|JSON String|What are the most frequent post-condition blocks in the post section within jenkins pipelines? Create distribution graphs for post-condition blocks.
counts_of_post_elements|JSON Object|Only for Q1. Counts of various conditional blocks found in POST section of jenkins file
research_question_1b|JSON String|What are the most frequent activities in the post section conditional blocks within jenkins pipelines? Create distribution graphs for post-condition blocks.
counts_of_activities_in_post_blocks|JSON Object|Only for Q1. Counts of various activities executed inside the conditional blocks of POST section.
research_question_2|JSON String|How is the presence of triggers in a pipeline correlates with the number of stages in the pipeline? What are the common types of triggers used in pipelines?
corelation_coefficient|JSON String or JSON Number|Only for Q2. The actual value is calculated from the python script.
counts_of_types_of_triggers|JSON Object|Only for Q2. Counts of different triggers present in the triggers section.
counts_of_triggers_and_stages|JSON Array|Only for Q2. A list of no. of triggers and stages for each jenkisnfile.
research_question_3a|JSON String|What are the most and the least frequent commands in pipeline stages?
counts_commands_in_stages_operations|JSON Object| Only for Q3. stores objects for each stage with a list of for commands executed for that stage.
research_question_3b|JSON String| What are the most and the least frequent operations in pipeline stages?
counts_of_operation_stages|JSON Object| Only for Q3.Stores counts for each operation stages.
research_question_4|JSON String| For stages in parallel, fail-fast feature is used for what type of operations(stage names)? When it is used/unused, what are the operations running in parallel?
parallel_stages_analysis|JSON Array|Only for Q4. A list containing objects for each jenkinsfile with data of outer_stage_name,parallel stages, fail-fast used or not.
valid_jenkinsfiles_scanned|JSON Number|Keeps the count of the valid files scanned for the analyses.
project_details|JSON Array|List of Jenkinsfile's Project and the parsed JSON output of the jenkinsfile.


## Issues Faced:
----------
1. Jenkins API Bottleneck:
	
	Many simultaneous requests are sent to Jenkins pipeline-model-definition API which converts the Jenkinsfile and provides in JSON form. If port is not free for new request, the request returns an error code `ECONNRESET`. 
	
	Currently we made recursive calls until we get a valid response or some other error message. This recursive call is limited by the number provided else it goes into infinite loop.
	
2. Github `Abuse Detection Mechanism`:
 
	If the application is run from index.js in root level, all questions module would be running simultaneously. This is detected by Github API as a `You have triggered an abuse detection mechanism.`. So please execute manually all the questions.


## Built With

----------

* [Node](https://nodejs.org/en/) - Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.
* [Octokit](https://github.com/octokit/rest.js) - GitHub REST API client for Node.js
* [Python](https://www.python.org/) - Used for graph creation and co-relation factor calculations
* [Matplotlib](https://matplotlib.org/) - Python library which is used for graph creation.
* [Pipeline-model-definition-plugin of Jenkins](https://github.com/jenkinsci/pipeline-model-definition-plugin/blob/master/EXTENDING.md#conversion-to-json-representation-from-jenkinsfile) - Takes a Jenkinsfile and converts it to the JSON representation for its pipeline step.
* [Docker](https://www.docker.com/) - Serves as platform for various application containers.
* [Jenkins](https://jenkins.io/) - Server to automate building, testing and deploying software.

## Authors

----------

* [**Amrish Jhaveri**](https://github.com/AmrishJhaveri)
* [**Chinmay Gangal**](https://github.com/chinmay2312)
