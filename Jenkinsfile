#!groovy
library "deploy_pipeline@master"

node('linux && docker') {
  checkout scm
  withEnv(["npm_config_cache=npm-cache"]){
    withDockerContainer(image: 'node:12') {

      stage('Setup') {
        sh(script: 'npm run setup')
      }

      stage('Build') {
        sh(script: 'npm run build')
      }

      stage("Snyk") {
        runSnyk(org: "coveo-jsui", projectName: "headless", directory: "packages/headless")
      }
    }

    if (env.BRANCH_NAME != "master") {
      return
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
      sh(
        script: "deployment-package package create --with-deploy"
      )
    }
  }
}