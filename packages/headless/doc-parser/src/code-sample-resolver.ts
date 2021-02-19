import {readFileSync} from 'fs';
import {resolve} from 'path';

const packageJsonPath = resolve(__dirname, '../../', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

export interface SamplePaths {
  react_class?: string[];
  react_fn?: string[];
}

export interface CodeSampleInfo {
  githubInfo: GithubInfo;
  samples: Paths;
}

interface GithubInfo {
  owner: string;
  repo: string;
  ref: string;
}

interface Paths {
  react: {
    class: SampleInfo[];
    fn: SampleInfo[];
  };
}

interface SampleInfo {
  path: string;
  code: string;
  fileName: string;
}

export function resolveCodeSamplePaths(paths: SamplePaths): CodeSampleInfo {
  return {
    githubInfo: buildGithubInfo(),
    samples: resolveSamples(paths),
  };
}

function buildGithubInfo(): GithubInfo {
  return {
    owner: 'coveo',
    repo: 'ui-kit',
    ref: `v${packageJson.version}`,
  };
}

function resolveSamples(paths: SamplePaths): Paths {
  const reactClass = paths.react_class || [];
  const reactFn = paths.react_fn || [];

  return {
    react: {
      class: reactClass.map(resolveSample),
      fn: reactFn.map(resolveSample),
    },
  };
}

function resolveSample(path: string): SampleInfo {
  const code = resolveCode(path);
  const fileName = extractFileName(path);

  return {
    path,
    code,
    fileName,
  };
}

function resolveCode(path: string) {
  const resolvedPath = resolve(__dirname, '../../../../', path);
  return readFileSync(resolvedPath, 'utf-8');
}

function extractFileName(path: string) {
  const lastSlashIndex = path.lastIndexOf('/');
  return path.slice(lastSlashIndex + 1);
}
