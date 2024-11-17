pipeline {
    agent {
        docker {
            image 'node:14' // Use a Node.js Docker image as the Jenkins agent
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
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                // Run tests using a common testing framework (e.g., Jest, Mocha)
                sh 'npm test'
            }
        }
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
