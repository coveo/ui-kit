node('linux && docker') {
  checkout scm
  def commitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
  def tag = sh(script: "git tag --contains", returnStdout: true).trim()
  def isBump = tag ==~ /^v[0-9].*$/
  def isMaster = env.BRANCH_NAME == 'master'

  withEnv(['npm_config_cache=npm-cache', 'CI=true']) {
    withDockerContainer(image: 'node:14', args: '-u=root') {
      stage('Setup') {
        sh 'npm run setup'
      }

      stage('Build') {
        sh 'npm run build'
      }

      stage('Install Chrome') {
        sh "wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -"
        sh "echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list"
        sh "apt-get update"
        sh "apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 libxtst6 --no-install-recommends"
        sh "google-chrome --version"
      }

      stage('Linting') {
        sh 'npm run lint:check'
      }

      stage('Unit Test') {
        sh 'npm test'
        junit 'packages/*/reports/*.xml'
      }

      stage('Cypress Test') {
        sh 'apt-get -y install libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libgbm-dev libnss3 libasound2 xauth xvfb'
        sh 'rm -rf /var/lib/apt/lists/*'
        sh 'cd packages/atomic && npx cypress install'
        sh 'cd packages/atomic && npm run start:prod & npx wait-on http://localhost:3333'
        sh 'NO_COLOR=1 npm run cypress:test'
      }

      stage('Generate Docs') {
        sh 'npm run doc:generate'
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
      withDockerContainer(image: 'node:14', args: '-u=root') {
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
        lerna = readJSON file: 'lerna.json'
        version = lerna.version
        (minor, major) = (version =~ /^([^\.]*)\.[^\.]*/)[0]
        sh "deployment-package package create --with-deploy --resolve COMMIT_HASH=${commitHash} --resolve MINORVERSION=${minor} --resolve MAJORVERSION=${major} || true"
      }
    }
  }
}