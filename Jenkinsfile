def parseSemanticVersion(String version) {
  def semanticVersionRegex = /^(((([0-9]+)\.[0-9]+)\.[0-9]+)(?:\-.+)?)$/
  def (_, prerelease, patch, minor, major) = (version =~ semanticVersionRegex)[0]
  return [major, minor, patch, prerelease]
}

node('heavy && linux && docker') {
  checkout scm
  def releaseCommit

  withEnv(['npm_config_cache=npm-cache', 'CI=true', 'NODE_OPTIONS=--max_old_space_size=8192']) {
    withDockerContainer(image: 'node:18', args: '-u=root -e HOME=/tmp -e NPM_CONFIG_PREFIX=/tmp/.npm') {
      stage('Setup') {
        sh 'npm ci'
      }

      stage('Build') {
        sh 'npm run build'
      }
    }

    withDockerContainer(image: '458176070654.dkr.ecr.us-east-1.amazonaws.com/jenkins/deployment_package:v7') {

      stage('Deployment pipeline upload') {
        headless = readJSON file: 'packages/headless/package.json'
        atomic = readJSON file: 'packages/atomic/package.json'
        atomicReact = readJSON file: 'packages/atomic-react/package.json'
        atomicHostedPage = readJSON file: 'packages/atomic-hosted-page/package.json'
        releaseCommit = sh(returnStdout:true, script: 'git rev-parse HEAD').trim()

        (headlessMajor, headlessMinor, headlessPatch) = parseSemanticVersion(headless.version)
        (atomicMajor, atomicMinor, atomicPatch) = parseSemanticVersion(atomic.version)
        (atomicReactMajor, atomicReactMinor, atomicReactPatch) = parseSemanticVersion(atomicReact.version)
        (atomicHostedPageMajor, atomicHostedPageMinor, atomicHostedPagePatch) = parseSemanticVersion(atomicHostedPage.version)
        
        sh "deployment-package package create --with-deploy \
        --resolve HEADLESS_MAJOR_VERSION=${headlessMajor} \
        --resolve HEADLESS_MINOR_VERSION=${headlessMinor} \
        --resolve HEADLESS_PATCH_VERSION=${headlessPatch} \
        --resolve ATOMIC_MAJOR_VERSION=${atomicMajor} \
        --resolve ATOMIC_MINOR_VERSION=${atomicMinor} \
        --resolve ATOMIC_PATCH_VERSION=${atomicPatch} \
        --resolve ATOMIC_REACT_MAJOR_VERSION=${atomicReactMajor} \
        --resolve ATOMIC_REACT_MINOR_VERSION=${atomicReactMinor} \
        --resolve ATOMIC_REACT_PATCH_VERSION=${atomicReactPatch} \
        --resolve ATOMIC_HOSTED_PAGE_MAJOR_VERSION=${atomicHostedPageMajor} \
        --resolve ATOMIC_HOSTED_PAGE_MINOR_VERSION=${atomicHostedPageMinor} \
        --resolve ATOMIC_HOSTED_PAGE_PATCH_VERSION=${atomicHostedPagePatch} \
        --changeset ${releaseCommit} \
        || true"
      }
    }
  }
}