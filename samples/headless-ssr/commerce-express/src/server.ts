import express from 'express';
import {renderApp} from './common/renderApp.js';
import {renderHtml} from './common/renderHtml.js';
import {searchEngineDefinition} from './lib/engine-definition.js';
import {getNavigatorContext} from './lib/navigatorContext.js';
import {middleware} from './middleware.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(middleware);
app.use(express.static('dist'));

app.get('/', async (req, res) => {
  try {
    searchEngineDefinition.setNavigatorContextProvider(() =>
      getNavigatorContext(req)
    );

    const queryFromRequest = req.query.q ?? '';
    const staticState = await searchEngineDefinition.fetchStaticState({
      controllers: {
        searchBox: {initialState: {value: queryFromRequest}},
        parameterManager: {
          initialState: {parameters: {q: queryFromRequest }},
        },
        productList: {initialState: {parameters: {q: queryFromRequest }}},
      },
    });

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
