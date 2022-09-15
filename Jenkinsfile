node('heavy && linux && docker') {
  checkout scm
  def tag = sh(script: "git tag --contains", returnStdout: true).trim()
  def isBump = !!tag
  def isMaster = env.BRANCH_NAME == 'master'

  if (!isMaster) {
    return
  }

  if (!isBump) {
    return
  }

  withEnv(['npm_config_cache=npm-cache', 'CI=true', 'NODE_OPTIONS=--max_old_space_size=8192']) {
    withDockerContainer(image: 'node:16', args: '-u=root -e HOME=/tmp -e NPM_CONFIG_PREFIX=/tmp/.npm') {
      stage('Setup') {
        sh 'npm ci'
      }

      stage('Build') {
        sh 'npm run build'
      }

      stage('Generate docs') {
        sh 'npm run doc:generate'
      }
    }

    stage('Clean working directory') {
      sh 'git checkout -- .'
      sh 'git clean -f'
    }

    withDockerContainer(image: 'node:16', args: '-u=root -e HOME=/tmp -e NPM_CONFIG_PREFIX=/tmp/.npm') {
      stage('Npm publish') {
        withCredentials([
        string(credentialsId: 'NPM_TOKEN', variable: 'NPM_TOKEN')]) {
          sh "echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > ~/.npmrc"
          sh 'npm run npm:publish:alpha || true'
        }
      }
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {

      stage('Deployment pipeline upload') {
        headless = readJSON file: 'packages/headless/package.json'
        atomic = readJSON file: 'packages/atomic/package.json'
        atomicReact = readJSON file: 'packages/atomic-react/package.json'
        semanticVersionRegex = /^([^\.]*)\.[^\.]*/

        (headlessMinor, headlessMajor) = (headless.version =~ semanticVersionRegex)[0]
        (atomicMinor, atomicMajor) = (atomic.version =~ semanticVersionRegex)[0]
        (atomicReactMinor, atomicReactMajor) = (atomicReact.version =~ semanticVersionRegex)[0]

        
        sh "deployment-package package create --with-deploy \
        --resolve HEADLESS_MAJOR_VERSION=${headlessMajor} \
        --resolve HEADLESS_MINOR_VERSION=${headlessMinor} \
        --resolve HEADLESS_PATCH_VERSION=${headless.version} \
        --resolve ATOMIC_MAJOR_VERSION=${atomicMajor} \
        --resolve ATOMIC_MINOR_VERSION=${atomicMinor} \
        --resolve ATOMIC_PATCH_VERSION=${atomic.version} \
        --resolve ATOMIC_REACT_MAJOR_VERSION=${atomicReactMajor} \
        --resolve ATOMIC_REACT_MINOR_VERSION=${atomicReactMinor} \
        --resolve ATOMIC_REACT_PATCH_VERSION=${atomicReact.version} \
        || true"
      }
    }
  }
}