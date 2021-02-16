import {readFileSync} from 'fs';
import {resolve} from 'path';

const path = resolve('package.json');
const packageJson = JSON.parse(readFileSync(path, 'utf-8'));

export interface SamplePaths {
  react_class?: string[];
  react_fn?: string[];
}

interface GithubInfo {
  owner: string;
  repo: string;
  ref: string;
}

interface Paths {
  react: {
    class: string[];
    fn: string[];
  };
}

export interface Samples {
  githubInfo: GithubInfo;
  paths: Paths;
}

export function buildCodeSampleConfiguration(paths: SamplePaths): Samples {
  return {
    githubInfo: buildGithubInfo(),
    paths: buildPaths(paths),
  };
}

function buildGithubInfo(): GithubInfo {
  return {
    owner: 'coveo',
    repo: 'ui-kit',
    ref: `v${packageJson.version}`,
  };
}

function buildPaths(paths: SamplePaths): Paths {
  return {
    react: {
      class: paths.react_class || [],
      fn: paths.react_fn || [],
    },
  };
}
