node('linux && docker') {
  checkout scm
  def shouldDeploy = env.BRANCH_NAME == 'master'

  withEnv([
    'npm_config_cache=npm-cache',
    'CI=true'
  ]){
    withDockerContainer(image: 'node:13', args: '-u=root') {
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
        
        sh "apt-get -y -f install google-chrome-stable"
        sh "google-chrome --version"
      }

      stage('Test') {
        sh 'npm test'
      }
    }

    if (!shouldDeploy) {
      return
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
      stage('Veracode package') {
        sh 'rm -rf veracode && mkdir veracode'

        sh 'mkdir veracode/headless'
        sh 'cp -R packages/headless/src packages/headless/package.json packages/headless/package-lock.json veracode/headless'
      }

      sh 'deployment-package package create --with-deploy'
    }
  }
}