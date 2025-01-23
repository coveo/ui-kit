import {build} from 'esbuild';
import {existsSync, readdirSync} from 'fs';
import {join, resolve, dirname} from 'path';

function externalizeAllPackagesExcept(noExternals) {
  return {
    name: 'noExternal-plugin',
    setup(build) {
      if (noExternals.length > 0) {
        build.onResolve({filter: /(.*)/}, (args) => {
          console.log(args);
          if (
            args.kind === 'import-statement' &&
            !noExternals.includes(args.path.split('/')[0])
          ) {
            return {path: args.path, external: true};
          }
        });
      }
    },
  };
}

async function bundle(filePath) {
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  console.log(`Bundling file: ${filePath}`);

  await build({
    entryPoints: [filePath],
    bundle: true,
    allowOverwrite: true,
    outdir: dirname(filePath),
    format: 'esm',
    loader: {
      '.svg': 'dataurl',
      '.css': 'css',
    },
    splitting: true,
    packages: 'external',
    chunkNames: '[name]',
    entryNames: '[dir]/[name]',
  });

  console.log(`Bundled file: ${join(dirname(filePath), '.js')}`);
}

async function bundleAll() {
  const distDirs = [
    resolve('dist/atomic/components/components'),
    resolve('dist/atomic/components/utils'),
  ];

  for (const distDir of distDirs) {
    console.log(distDir);
    const jsFiles = readdirSync(distDir).filter((file) => file.endsWith('.js'));

    for (const jsFile of jsFiles) {
      const jsFilePath = join(distDir, jsFile);
      console.log(jsFilePath);
      await bundle(jsFilePath);
    }
  }
}

bundleAll();
