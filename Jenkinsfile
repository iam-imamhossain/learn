pipeline {
    agent none
    stages {
        stage('git Checkout,Build,test') {
            agent {
                docker {
                    image 'node:latest'
                    args '--user root -v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
             steps {
                // Clone the repository from GitHub
                git branch: 'main', 
                credentialsId: null,
                url: 'https://github.com/iam-imamhossain/learn.git' // Replace with your repo URL
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
             environment {
                DOCKER_IMAGE = 'imam2000/spelling_practice' // Replace with your Docker image name
            }
            agent {
                docker {
                    image 'docker:latest'
                    args '--user root -v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                sh 'docker build -t $DOCKER_IMAGE:${BUILD_NUMBER} .'
                script {
                    // Authenticate and push the Docker image
                    withDockerRegistry([credentialsId: 'jenkins-office']) {
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