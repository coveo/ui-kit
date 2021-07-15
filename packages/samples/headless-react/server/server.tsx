import path from 'path';
import fs from 'fs';

import express from 'express';
import escape from 'escape-html';
import ReactDOMServer from 'react-dom/server';

import App from '../src/App';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  buildSearchStatus,
  SearchEngine,
} from '@coveo/headless';

const PORT = 3000;
const app = express();

app.get('/', async (req, res) => {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });

  renderServerSide(engine);
  await firstSearchExecuted(engine);
  const app = renderServerSide(engine);

  const indexFile = path.resolve('./build/index.html');
  fs.readFile(indexFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err);
      return res.status(500).send('Internal error');
    }

    const state = escape(JSON.stringify(engine.state));
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
    searchStatus.subscribe(
      () => searchStatus.state.firstSearchExecuted && resolve(true)
    );
    engine.executeFirstSearch();
  });
}

app.use(express.static('./build'));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
