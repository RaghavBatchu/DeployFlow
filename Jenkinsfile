pipeline {
    agent any

    environment {
        // We ensure docker-compose uses a consistent project name to avoid conflict
        COMPOSE_PROJECT_NAME = 'deployflow_prod'
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins automatically checks out the repository when triggered via Multibranch Pipeline/GitHub
                checkout scm
            }
        }

        stage('Build Environment') {
            steps {
                echo 'Building Docker Images...'
                // If you need to copy a specific .env file injected via Jenkins credentials, do it here
                sh 'docker compose build'
            }
        }

        stage('Deploy Application') {
            steps {
                echo 'Deploying to host...'
                // Stop any running instances first
                sh 'docker compose down'
                // Start the new containers
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo "Deployment successful!"
            // Note: If you want Jenkins to send an email about its OWN deployment success, uncomment below
            /*
            emailext (
                subject: "SUCCESS: Pipeline '${JOB_NAME}' deployment complete",
                body: "DeployFlow latest version is live!\n\nBuild: ${BUILD_NUMBER}\nView: ${BUILD_URL}",
                to: "admin@example.com", // Replace with your email
                replyTo: "no-reply@example.com",
                mimeType: 'text/html'
            )
            */
        }
        failure {
            echo "Deployment failed."
            /*
            emailext (
                 subject: "FAILED: Pipeline '${JOB_NAME}' failed",
                 body: "The deployment for DeployFlow failed to build/run.\n\nBuild Number: ${BUILD_NUMBER}\nCheck console output at: ${BUILD_URL}",
                 to: "admin@example.com"
            )
            */
        }
        always {
            // Clean up unused/dangling docker images to preserve space on your server
            sh 'docker image prune -f'
        }
    }
}
