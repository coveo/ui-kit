import {build} from 'esbuild';
import {join} from 'node:path';
import {appendFileSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';

function jsBundle() {
  const entry = join('dist/components/index.js');
  const contents = readFileSync(entry, 'utf-8');
  const toAppend = '\ndefineCustomElements();';
  if (!contents.includes(toAppend)) {
    appendFileSync(entry, toAppend);
  }

  return build({
    entryPoints: ['dist/components/index.js'],
    bundle: true,
    minify: true,
    outfile: 'dist/bundle/index.js',
    format: 'esm',
  });
}

function cssBundle() {
  return build({
    entryPoints: ['src/style/index.css'],
    outfile: 'dist/bundle/index.css',
    bundle: true,
    minify: true,
  });
}

function html() {
  const entry = join('src/pages/index.html');
  const outputFile = join('dist/bundle/index.html');
  const htmlContents = readFileSync(entry, 'utf-8');
  const hostedPageContents =
    /<atomic-hosted-page>((.|\n)*)<\/atomic-hosted-page>/gm
      .exec(htmlContents)[1]
      .trim();

  writeFileSync(outputFile, hostedPageContents, 'utf-8');
}

async function main() {
  mkdirSync('dist/bundle', {recursive: true});

  await Promise.all([jsBundle(), cssBundle(), html()]);
}

main();
