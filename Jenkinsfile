node('linux && docker') {
  checkout scm
  def isMaster = env.BRANCH_NAME == 'master'

  withEnv([
    'npm_config_cache=npm-cache',
    'CI=true'
  ]){
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

      stage('Unit Test') {
        sh 'npm test'
      }

      // stage('Cypress Test') {
      //   sh 'apt-get -y install libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libgbm-dev libnss3 libasound2 xauth xvfb'
      //   sh 'rm -rf /var/lib/apt/lists/*'
      //   sh 'cd packages/atomic && npx cypress install'
      //   sh 'npm start & npx wait-on http://localhost:3333'
      //   sh 'NO_COLOR=1 npm run cypress:test'
      // }
    }

    if (!isMaster) {
      return
    }

    stage('Clean working directory') {
      sh 'git checkout -- .'
      sh 'git clean -f'
    }

    withDockerContainer(image: 'node:14', args: '-u=root') {
      stage('Bump version') {
        withCredentials([
          usernameColonPassword(credentialsId: 'bitbucket-anti-throttling-03', variable: 'BB_CREDENTIALS')
        ]) {
          sh 'npm run bump:version'
        }
      }

      stage('Npm publish') {
        withNPM(npmrcConfig:'coveo-organization') {
          sh 'npm run npm:publish'
        }
      }
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
      stage('Veracode package') {
        sh 'rm -rf veracode && mkdir veracode'

        sh 'mkdir veracode/headless'
        sh 'cp -R packages/headless/src packages/headless/package.json packages/headless/package-lock.json veracode/headless'
      }

      stage('Deployment pipeline upload') {
        sh 'deployment-package package create --with-deploy || true'
      }
    }
  }
}