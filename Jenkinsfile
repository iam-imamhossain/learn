pipeline {
    agent {
        docker {
            image 'node:latest' // Use a Node.js Docker image as the Jenkins agent
            args '--user root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    environment {
        DOCKER_IMAGE = 'imam2000/spelling_practice' // Replace with your Docker image name
    }
    stages {
        stage('Checkout') {
            steps {
                // Clone the repository from GitHub
                git branch: 'main', url: 'https://github.com/iam-imamhossain/learn.git' // Replace with your repo URL
            }
        }
        stage('Install Dependencies') {
            steps {
                // Install Node.js dependencies
                 sh '''
                 apt-get update && \
                 apt-get install -y docker.io && \
                 rm -rf /var/lib/apt/lists/*
                 ''' 
                 sh 'npm install'
            }
        }
        // stage('Run Tests') {
        //     steps {
        //         // Run tests using a common testing framework (e.g., Jest, Mocha)
        //         sh 'npm install --save-dev mocha'
        //         sh 'npm run'
        //         sh 'npm test'
        //     }
        // }
        stage('Build Docker Image') {
            steps {
                script {
                    // Build Docker image
                    sh 'docker build -t $DOCKER_IMAGE:${BUILD_NUMBER} .'
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    // Authenticate and push the Docker image
                    withDockerRegistry([credentialsId: 'docker_id']) {
                        sh 'docker push $DOCKER_IMAGE:${BUILD_NUMBER}'
                    }
                }
            }
        }
    }
    post {
        always {
            // Cleanup Docker images on the agent to free space
            sh 'docker rmi $DOCKER_IMAGE:${BUILD_NUMBER} || true'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
