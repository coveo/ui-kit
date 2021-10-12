node('linux && docker') {
  checkout scm
  def tag = sh(script: "git tag --contains", returnStdout: true).trim()
  def isBump = !!tag
  def isMaster = env.BRANCH_NAME == 'master'

  withEnv(['npm_config_cache=npm-cache', 'CI=true', 'NODE_OPTIONS=--max_old_space_size=4096']) {
    withDockerContainer(image: 'node:16', args: '-u=root -e HOME=/tmp -e NPM_CONFIG_PREFIX=/tmp/.npm') {
      stage('Setup') {
        sh 'npm ci'
        sh 'npx lerna bootstrap --ci'
        if (!isBump) {
          sh 'npm run lockLernaDependencies'
        }
      }

      stage('Build') {
        sh 'npm run build'
      }

      stage('Linting') {
        sh 'npm run lint:check'
      }

      stage('Generate Docs') {
        sh 'npm run doc:generate'
      }

      stage('Unit Test') {
        sh 'npm test'
        junit 'packages/*/reports/*.xml'
      }
    }

    if (!isMaster) {
      return
    }

    stage('Clean working directory') {
      sh 'git checkout -- .'
      sh 'git clean -f'
    }

    if (!isBump) {
      withDockerContainer(image: 'node:16', args: '-u=root') {
        stage('Commit bumped version') {
          sh 'git clean -xfd -e node_modules/ -e .husky'
          withCredentials([
          usernameColonPassword(credentialsId: 'github-commit-token', variable: 'GH_CREDENTIALS')]) {
            sh 'npm run bump:version'
          }
        }
      }
      return
    }

    withDockerContainer(image: 'node:14', args: '-u=root') {
      stage('Npm publish') {
        withCredentials([
        string(credentialsId: 'NPM_TOKEN', variable: 'NPM_TOKEN')]) {
          sh "echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > ~/.npmrc"
          sh 'npm run npm:publish:alpha || true'
        }
      }
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
      stage('Veracode package') {
        sh 'rm -rf veracode && mkdir veracode'

        sh 'mkdir veracode/bueno'
        sh 'cp -R packages/bueno/src packages/bueno/package.json packages/bueno/package-lock.json veracode/bueno'

        sh 'mkdir veracode/headless'
        sh 'cp -R packages/headless/src packages/headless/package.json packages/headless/package-lock.json veracode/headless'

        sh 'mkdir veracode/atomic'
        sh 'cp -R packages/atomic/src packages/atomic/package.json packages/atomic/package-lock.json veracode/atomic'
      }

      stage('Deployment pipeline upload') {
        headless = readJSON file: 'packages/headless/package.json'
        atomic = readJSON file: 'packages/atomic/package.json'
        semanticVersionRegex = /^([^\.]*)\.[^\.]*/

        (headlessMinor, headlessMajor) = (headless.version =~ semanticVersionRegex)[0]
        (atomicMinor, atomicMajor) = (atomic.version =~ semanticVersionRegex)[0]
        
        sh "deployment-package package create --with-deploy \
        --resolve HEADLESS_MINOR_VERSION=${headlessMinor} \
        --resolve HEADLESS_MAJOR_VERSION=${headlessMajor} \
        --resolve ATOMIC_MINOR_VERSION=${atomicMinor} \
        --resolve ATOMIC_MAJOR_VERSION=${atomicMajor} \
        || true"
      }
    }
  }
}