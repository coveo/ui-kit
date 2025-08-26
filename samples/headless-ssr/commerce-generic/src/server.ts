import express from 'express';
import {engineDefinition} from './common/engine.js';
import {getNavigatorContext} from './common/navigatorContext.js';
import {renderApp} from './common/renderApp.js';
import {renderHtml} from './common/renderHtml.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('dist'));

app.get('/', async (req, res) => {
  try {
    engineDefinition.searchEngineDefinition.setNavigatorContextProvider(() =>
      getNavigatorContext(req)
    );

    const staticState =
      await engineDefinition.searchEngineDefinition.fetchStaticState({});

    const appHtml = renderApp(staticState);
    const html = renderHtml(appHtml, staticState);

    res.send(html);
  } catch (error) {
    console.error('❌ Error fetching static state:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
