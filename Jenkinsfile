node('linux && build && docker') {
  checkout scm
  withEnv(["npm_config_cache=npm-cache"]){
    withDockerContainer(image: 'node:13') {

      stage('Setup') {
        sh(script: 'npm run setup')
      }

      stage('Build') {
        sh(script: 'npm run build')
      }

      withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
        stage('Deploy') {
          sh "deployment-package package create"
        }
      }
    }
  }
}