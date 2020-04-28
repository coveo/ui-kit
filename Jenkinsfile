node('linux && docker') {
  checkout scm
  def shouldDeploy = env.BRANCH_NAME == 'master'

  withEnv(['npm_config_cache=npm-cache']){
    withDockerContainer(image: 'node:13') {
      stage('Setup') {
        sh(script: 'npm run setup')
      }

      stage('Build') {
        sh(script: 'npm run build')
      }

      stage('Test') {
        sh(script: 'npm test')
      }
    }

    if (!shouldDeploy) {
      return
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
      stage('Veracode package') {
        sh(script: 'rm -rf veracode && mkdir veracode')

        sh(script: 'mkdir veracode/headless')
        sh(script: 'cp -R packages/headless/src packages/headless/package.json packages/headless/package-lock.json veracode/headless')
      }

      sh(
        script: 'deployment-package package create --with-deploy'
      )
    }
  }
}