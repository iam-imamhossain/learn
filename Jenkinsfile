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
                sh 'npm install'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    // Build Docker image
                    sh 'docker build -t $DOCKER_IMAGE:${BUILD_NUMBER} .'

                    def dockerImage = docker.image("${DOCKER_IMAGE}:${BUILD_NUMBER}")
                    docker.withRegistry('https://index.docker.io/v1/', 'docker_officer') {
                        dockerImage.push()
                    }
                }
            }
        }
        stage('show files in directory') {
            steps {
                sh 'ls -ltr'
                sh  'ls -ltr deployment'
            }
        }
       stage('Update Deployment File') {
            environment {
                GIT_REPO_NAME = "learn"
                GIT_USER_NAME = "iam-imamhossain"
            }
            steps {
                withCredentials([string(credentialsId: 'git-token', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        git config user.email "mdnazmulhashan@gmail.com"
                        git config user.name "iam-imamhossain"
                        BUILD_NUMBER=${BUILD_NUMBER}
                        sed -i "s/image: imam2000\\/spelling_practice:.*/image: imam2000\\/spelling_practice:${BUILD_NUMBER}/" deployment/deployment.yaml
                        git add . deployment/deployment.yml
                        git commit -m "Update deployment image to version ${BUILD_NUMBER}"
                        git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:main
                    '''
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
