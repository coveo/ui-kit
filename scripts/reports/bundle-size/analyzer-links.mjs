import {Buffer} from 'node:buffer';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {determineUseCase, getFilePaths} from './command.mjs';

function getAnalyzerLinks() {
  const dir = resolve('packages', 'headless', 'dist', 'browser');
  const entries = getBrowserStatsFilePaths(dir);
  return entries.map((entry) => {
    const statsAsBase64 = Buffer.from(readFileSync(entry)).toString('base64');
    const useCase = determineUseCase(dir, entry);
    return {
      useCase,
      statsAsBase64,
    };
  });
}

function getBrowserStatsFilePaths(dir) {
  const paths = getFilePaths(dir);
  return paths.filter((path) => path.endsWith('esm.stats.json'));
}

export function buildAnalyserLinksReport() {
  const links = getAnalyzerLinks();
  return `
    **Links to bundle analyser**

    ${links.map(({useCase, statsAsBase64}) => {
      return `- [${useCase}](https://shiny-journey-m5j8nee.pages.github.io/)`;
    })}
    `;
}
