#!groovy

library(
  identifier: 'jenkins-common-lib@v1.6',
  retriever: modernSCM(github(credentialsId: 'github-app-dev', repository: 'jenkins-common-lib', repoOwner: 'coveo')),
  changelog: false
)

pipeline {
  agent {
    label 'build && docker && linux'
  }

  options {
    ansiColor('xterm')
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 45, unit: 'MINUTES')
  }

  stages {
    stage('Build') {
      steps {
        script {
          def nodeHome = tool name: 'NodeJS Latest', type: 'nodejs'
          env.PATH = "${nodeHome}/bin:${env.PATH}"
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test'
      }
    }

    stage('Deployment Pipeline') {
      steps {
        script {
          sh 'npm run prepare-deploy'
          env.PACKAGE_JSON_MAJOR_MINOR_PATCH_VERSION = sh(script: './read.version.sh patch', returnStdout: true).trim()
          env.PACKAGE_JSON_MAJOR_MINOR_VERSION = sh(script: './read.version.sh minor', returnStdout: true).trim()
          env.PACKAGE_JSON_MAJOR_VERSION = sh(script: './read.version.sh major', returnStdout: true).trim()
          def tgfResolveParameter = [
            "PACKAGE_JSON_MAJOR_MINOR_PATCH_VERSION=${env.PACKAGE_JSON_MAJOR_MINOR_PATCH_VERSION}",
            "PACKAGE_JSON_MAJOR_MINOR_VERSION=${env.PACKAGE_JSON_MAJOR_MINOR_VERSION}",
            "PACKAGE_JSON_MAJOR_VERSION=${env.PACKAGE_JSON_MAJOR_VERSION}"
          ]
          def isMaster = env.BRANCH_NAME == 'master'
          deploymentPackage.command(command: 'package create', parameters: [
            resolve: tgfResolveParameter,
            withDeploy: isMaster,
            dryRun: !isMaster
          ])
        }
      }
    }
  }
}
