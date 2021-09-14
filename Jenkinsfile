node('linux && docker') {
  checkout scm
  def tag = sh(script: "git tag --contains", returnStdout: true).trim()
  def isBump = !!tag
  def isMaster = env.BRANCH_NAME == 'master'

  withEnv(['npm_config_cache=npm-cache', 'CI=true']) {
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

      stage('Cypress Test (Atomic)') {
        sh 'apt-get -y install libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libgbm-dev libnss3 libasound2 xauth xvfb'
        sh 'rm -rf /var/lib/apt/lists/*'
        sh 'cd packages/atomic && ./node_modules/cypress/bin/cypress install'
        sh 'cd packages/atomic && npm run start:prod & npx wait-on http://localhost:3333'
        sh 'chown -R $(whoami) /tmp'
        sh 'cd packages/atomic && NO_COLOR=1 ./node_modules/cypress/bin/cypress run --record --key 0e9d8bcc-a33a-4562-8604-c04e7bed0c7e --browser chrome'
      }

      stage('Cypress Test (Quantic)') {
        withEnv(['SFDX_AUTH_JWT_INSTANCE_URL=https://login.salesforce.com', 'SFDX_AUTH_JWT_USERNAME=sfdc.integration.devv2.hub@coveo.com']) {
          withCredentials([
            string(credentialsId: 'sfdx-auth-client-id', variable: 'SFDX_AUTH_CLIENT_ID'),
            file(credentialsId: 'sfdx-auth-jwt-key', variable: 'SFDX_AUTH_JWT_KEY'),
          ]) {
            sh 'cd packages/quantic && ./node_modules/cypress/bin/cypress install'
            sh 'mkdir /tmp/.sfdx && echo "{}" > /tmp/.sfdx/sfdx-config.json'
            sh 'cd packages/quantic && ./node_modules/.bin/sfdx force:auth:jwt:grant --clientid $SFDX_AUTH_CLIENT_ID --jwtkeyfile $SFDX_AUTH_JWT_KEY --username $SFDX_AUTH_JWT_USERNAME --instanceurl $SFDX_AUTH_JWT_INSTANCE_URL --setdefaultdevhubusername'
            sh 'cd packages/quantic && npm run setup:examples'
            sh 'cd packages/quantic && NO_COLOR=1 ./node_modules/cypress/bin/cypress run --browser chrome'
            sh 'cd packages/quantic && .node_modules/.bin/ts-node scripts/build/delete-org.ts'
          }
        }
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

    withDockerContainer(image: 'node:16', args: '-u=root') {
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