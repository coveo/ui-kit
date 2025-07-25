import {spawnSync} from 'node:child_process';

export function coveoCdnResolve() {
  return {
    resolveId(source: string) {
      if (source === '@coveo/atomic/loader') {
        return {
          id: 'https://static.cloud.coveo.com/atomic/v3/index.js',
          external: true,
        };
      }
      if (source.startsWith('@coveo/atomic/themes')) {
        return {
          id: source.replace(
            '@coveo/atomic/themes',
            'https://static.cloud.coveo.com/atomic/v3/themes'
          ),
          external: true,
        };
      }
      if (source === '@coveo/atomic') {
        return {
          id: 'https://static.cloud.coveo.com/atomic/v3/index.esm.js',
          external: true,
        };
      }
      if (source === '@coveo/headless') {
        return {
          id: 'https://static.cloud.coveo.com/headless/v3/headless.esm.js',
          external: true,
        };
      }
    },
  };
}

export function coveoNpmResolve() {
  return {
    resolveId(source: string) {
      if (source.startsWith('@coveo')) {
        return nodeResolve(source, ['browser', 'default', 'import']);
      }
    },
  };
}

function nodeResolve(source: string, conditions: string[] = []) {
  return spawnSync(
    process.argv[0],
    [
      ...conditions.flatMap((condition) => ['-C', condition]),
      '-p',
      `require.resolve('${source}')`,
    ],
    {encoding: 'utf-8'}
  ).stdout.trim();
}
