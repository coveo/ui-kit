node('linux && docker') {
  checkout scm
  withEnv(["npm_config_cache=npm-cache"]){
    withDockerContainer(image: 'node', args: "-u=root") {

      stage('Setup') {
        sh(script: 'npm run setup')
      }

      stage('Build') {
        sh(script: 'npm run build')
      }

      withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
        stage('Deploy') {
          sh "deployment-package package create --with-deploy"
        }
      }
    }
  }
}