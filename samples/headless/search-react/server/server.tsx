import fs from 'node:fs';
import path from 'node:path';
import {
  buildSearchEngine,
  buildSearchStatus,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
} from '@coveo/headless';
import escapeHtml from 'escape-html';
import express from 'express';
// biome-ignore lint/correctness/noUnusedImports: <>
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from '../src/App';

const PORT = 3000;
const app = express();

app.get('/', async (_req, res) => {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });

  renderServerSide(engine);
  await firstSearchExecuted(engine);
  const app = renderServerSide(engine);

  const indexFile = path.resolve('./dist/index.html');
  fs.readFile(indexFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err);
      return res.status(500).send('Internal error');
    }

    const state = escapeHtml(JSON.stringify(engine.state));
    const page = data
      .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
      .replace(
        '<script id="ssr"></script>',
        `<script id="ssr">window.HEADLESS_STATE = ${state}</script>`
      );

    return res.send(page);
  });
});

function renderServerSide(engine: SearchEngine) {
  return ReactDOMServer.renderToString(<App engine={engine} />);
}

function firstSearchExecuted(engine: SearchEngine) {
  return new Promise((resolve) => {
    const searchStatus = buildSearchStatus(engine);
    const unsubscribe = searchStatus.subscribe(() => {
      if (searchStatus.state.firstSearchExecuted) {
        unsubscribe();
        resolve(true);
      }
    });
    engine.executeFirstSearch();
  });
}

app.use(express.static('./dist'));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
