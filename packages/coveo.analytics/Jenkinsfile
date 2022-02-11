#!groovy

def IS_MASTER = env.BRANCH_NAME == 'master'
def skipRemainingStages = false

library(
  identifier: 'jenkins-common-lib@v1.6',
  retriever: modernSCM(github(credentialsId: 'github-app-dev', repository: 'jenkins-common-lib', repoOwner: 'coveo')),
  changelog: false
)

pipeline {
  agent {
    label 'build && docker && linux'
  }

  parameters {
    booleanParam(defaultValue: false, description: 'Forces the deploy, even if the last commit is a version bump', name: 'FORCE_DEPLOY')
  }

  environment {
    NPM_TOKEN = credentials("npmjs_com_token")
    GIT = credentials('github-coveobot')
    GH_TOKEN = credentials('github-coveobot_token')
    SNYK_TOKEN = credentials("snyk_token")
  }

  options {
    ansiColor('xterm')
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 45, unit: 'MINUTES')
  }

  stages {
    stage('Skip') {
      when { expression { params.FORCE_DEPLOY == false } }
      steps {
        script {
          commitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
          if (commitMessage.contains('[version bump]')) {
            skipRemainingStages = true
            println 'Skipping this build because it was triggered by a version bump.'
          } else {
            skipRemainingStages = false
            println 'Not a version bump, the build will proceed.'
          }
        }
      }
    }

    stage('Setup') {
      when { expression { !skipRemainingStages } }
      steps {
        script {
          def nodeHome = tool name: 'NodeJS Latest', type: 'nodejs'
          env.PATH = "${nodeHome}/bin:${env.PATH}"
          sh "npm config set //registry.npmjs.org/:_authToken=${env.NPM_TOKEN}"
        }
      }
    }

    stage('Bump version') {
      when {
        allOf {
          expression { IS_MASTER }
          expression { !skipRemainingStages }
        }
      }
      steps {
        script {
          gitUtils.withCredentialHelper() {
            gitUtils.setUser()
            sh "git fetch"
            sh "git checkout master"
            sh "git pull"
            sh "npm version patch -m \"[version bump] Automated release to v%s\""
          }
        }
      }
    }

    stage('Build') {
      when { expression { !skipRemainingStages }}
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }

    stage('Test') {
      when { expression { !skipRemainingStages }}
      steps {
        sh 'npm run test'
      }
    }

    stage('Deployment Pipeline') {
      when { expression { !skipRemainingStages }}
      steps {
        script {
          runSnyk(org: "coveo-commerce", projectName: "coveo.analytics.js", directory: ".", archiveArtifacts: true)

          sh "npm publish --dry-run"
          sh 'npm run prepare-deploy'
          env.PACKAGE_JSON_MAJOR_MINOR_PATCH_VERSION = sh(script: './read.version.sh patch', returnStdout: true).trim()
          env.PACKAGE_JSON_MAJOR_MINOR_VERSION = sh(script: './read.version.sh minor', returnStdout: true).trim()
          env.PACKAGE_JSON_MAJOR_VERSION = sh(script: './read.version.sh major', returnStdout: true).trim()
          def tgfResolveParameter = [
            "PACKAGE_JSON_MAJOR_MINOR_PATCH_VERSION=${env.PACKAGE_JSON_MAJOR_MINOR_PATCH_VERSION}",
            "PACKAGE_JSON_MAJOR_MINOR_VERSION=${env.PACKAGE_JSON_MAJOR_MINOR_VERSION}",
            "PACKAGE_JSON_MAJOR_VERSION=${env.PACKAGE_JSON_MAJOR_VERSION}",
            "TF_VAR_package_json_major_version=${env.PACKAGE_JSON_MAJOR_VERSION}"
          ]
          deploymentPackage.command(command: 'package create', parameters: [
            version: env.PACKAGE_JSON_MAJOR_VERSION,
            resolve: tgfResolveParameter,
            withDeploy: IS_MASTER,
            dryRun: !IS_MASTER
          ])
        }
      }
    }

    stage('Publish') {
      when {
        allOf {
          expression { IS_MASTER }
          expression { !skipRemainingStages }
        }
      }
      steps {
        script {
          sh "npm publish"
          gitUtils.push()
        }
      }
    }
  }
}
