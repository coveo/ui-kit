import {context} from '@actions/github';
import {execSync} from 'child_process';
import {parse} from 'semver';
import atomicHostedPageJson from '../../packages/atomic-hosted-page/package.json' assert {type: 'json'};
import atomicReactJson from '../../packages/atomic-react/package.json' assert {type: 'json'};
import atomicJson from '../../packages/atomic/package.json' assert {type: 'json'};
import headlessJson from '../../packages/headless/package.json' assert {type: 'json'};

const releaseCommit = execSync('git rev-parse HEAD').toString().trim();

function getVersionComposants(version) {
  const parsedVersion = parse(version);
  return {
    major: parsedVersion?.major,
    minor: parsedVersion?.minor,
    patch: parsedVersion?.patch,
  };
}

const headless = getVersionComposants(headlessJson.version);
const atomic = getVersionComposants(atomicJson.version);
const atomicReact = getVersionComposants(atomicReactJson.version);
const atomicHostedPage = getVersionComposants(atomicHostedPageJson.version);
execSync(`
docker run -a stderr -a stdout 458176070654.dkr.ecr.us-east-2.amazonaws.com/jenkins/deployment_package:stable
  deployment-package --version`);