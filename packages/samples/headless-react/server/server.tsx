import path from 'path';
import fs from 'fs';

import express from 'express';
import ReactDOMServer from 'react-dom/server';

import App from '../src/App';
import {AppContext} from '../src/context/engine';
import {
  HeadlessEngine,
  searchAppReducers,
  SearchActions,
  AnalyticsActions,
} from '@coveo/headless';

const PORT = 8000;
const app = express();

app.get('/', async (req, res) => {
  const engine = new HeadlessEngine({
    configuration: HeadlessEngine.getSampleConfiguration(),
    reducers: searchAppReducers,
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

    const state = JSON.stringify(engine.state);
    const page = data
      .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
      .replace(
        '<script id="ssr"></script>',
        `<script id="ssr">window.HEADLESS_STATE = ${state}</script>`
      );

    return res.send(page);
  });
});

function renderServerSide(engine: HeadlessEngine<typeof searchAppReducers>) {
  return ReactDOMServer.renderToString(
    <AppContext.Provider value={{engine}}>
      <App />
    </AppContext.Provider>
  );
}

function firstSearchExecuted(engine: HeadlessEngine<typeof searchAppReducers>) {
  return new Promise((resolve) => {
    engine.subscribe(
      () => engine.state.search.response.searchUid && resolve(true)
    );
    const action = SearchActions.executeSearch(
      AnalyticsActions.logInterfaceChange()
    );
    engine.dispatch(action);
  });
}

app.use(express.static('./build'));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
