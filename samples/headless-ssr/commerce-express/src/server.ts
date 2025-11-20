/**
 * Express server for Coveo Headless Commerce SSR sample.
 *
 * Server-side SSR lifecycle:
 * 1. Receives a request for the root route (for example, / or /?q=...)
 * 2. Sets up navigation context (user agent, referrer, etc.) for analytics/personalization
 * 3. Extracts the search query from the request
 * 4. Fetches static state from the Coveo engine using the query and context fields
 * 5. Renders the app HTML with the static state and injects it into the template
 * 6. Sends the fully rendered HTML to the client for fast, SEO-friendly delivery
 *
 * See client.ts for client-side hydration details.
 */
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
    const queryFromRequest = req.query.q?.toString?.() ?? '';

    const staticState = await searchEngineDefinition.fetchStaticState({
      searchParams: {q: queryFromRequest},
      navigatorContext: getNavigatorContext(req),
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {url: req.url},
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
