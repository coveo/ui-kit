import express from 'express';
import type {InferStaticState} from '@coveo/headless/ssr-commerce-next';
import {engineDefinition} from './engine.js';
import {renderApp} from './renderApp.js';
import {renderHtml} from './renderHtml.js';

export type SearchStaticState = InferStaticState<
  typeof engineDefinition.searchEngineDefinition
>;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('dist'));

app.get('*', async (req, res) => {
  try {
    const staticState =
      await engineDefinition.searchEngineDefinition.fetchStaticState({
        url: 'https://sports.barca.group/search',
        language: 'en',
        country: 'US',
        currency: 'USD',
        query: '',
      });

    const app = renderApp(staticState);
    const html = renderHtml(app, staticState);

    res.send(html);
  } catch (error) {
    console.error('❌ Error fetching static state:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
