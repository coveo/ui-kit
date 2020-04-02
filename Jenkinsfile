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

      if (!shouldDeploy) {
        return
      }

      stage('Veracode package') {
        sh(script: 'npm run veracode')
      }
    }

    if (!shouldDeploy) {
      return
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {
      sh(
        script: 'deployment-package package create --with-deploy'
      )
    }
  }
}