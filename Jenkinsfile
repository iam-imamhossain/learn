pipeline {
    agent {
        docker {
            image 'imam2000/node-agent:v1' // Use a Node.js Docker image as the Jenkins agent
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
                sh 'docker --version'
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

                    def dockerImage = docker.image("${DOCKER_IMAGE}:${BUILD_NUMBER}")
                    docker.withRegistry('https://index.docker.io/v1/', 'docker_id') {
                        dockerImage.push()
                    }
                }
            }
        }
    // stage('Push Docker Image') {
    //     steps {
    //         script {
    //             // Authenticate and push the Docker image
    //             withDockerRegistry([credentialsId: 'docker_id']) {
    //                 sh 'docker push $DOCKER_IMAGE:${BUILD_NUMBER}'
    //             }
    //         }
    //     }
    // }
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
