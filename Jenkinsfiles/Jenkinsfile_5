pipeline {
    agent any

    stages {
        stage('Load Jenkinsfile'){
            steps {
                script{
                    if ( fileExists('target/Jenkinsfile') ){
                        load '/target/Jenkinsfile'
                    }else{
                        load '/src/main/scripts/Jenkinsfile'
                    }
                }
            }
        }
    }
}