/**
 * Express server for Coveo Headless Commerce SSR sample.
 *
 * Server-side SSR lifecycle (per request):
 * 1. Sets the navigator context provider (user agent, referrer, etc.) for analytics/personalization
 * 2. Deserializes commerce parameters (query, facets, sort, pagination) from the URL
 * 3. Fetches static state from the Coveo engine using those parameters and the context
 * 4. Renders the app HTML with the static state and injects it (plus the navigator context) into the template
 * 5. Sends the fully rendered HTML to the client for fast, SEO-friendly delivery
 *
 * See client.ts for client-side hydration details.
 */
import {buildParameterSerializer} from '@coveo/headless/ssr-commerce';
import express, {type Request} from 'express';
import {renderApp} from './common/renderApp.js';
import {renderHtml} from './common/renderHtml.js';
import {parseCartItems} from './lib/cart.js';
import {
  searchEngineDefinition,
  listingEngineDefinition,
} from './lib/engine-definition.js';
import {LISTING_IDS} from './lib/listings.js';
import {getNavigatorContext} from './lib/navigatorContext.js';
import {middleware} from './middleware.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(middleware);
app.use(express.static('dist'));

const DEFAULT_CONTEXT = {
  language: 'en',
  country: 'US',
  currency: 'USD',
} as const;

const deserializeParameters = (req: Request) => {
  const {deserialize} = buildParameterSerializer();
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  return deserialize(url.searchParams);
};

// Restores the cart from the external cart system (a cookie in this sample; see
// `lib/externalCartApi.ts`) so it survives navigation and reloads.
const getCartItems = (req: Request) => parseCartItems(req.headers.cookie);

app.get('/', (_req, res) => {
  res.redirect('/search');
});

app.get('/search', async (req, res) => {
  try {
    const navigatorContext = getNavigatorContext(req);
    searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

    const staticState = await searchEngineDefinition.fetchStaticState({
      controllers: {
        cart: {initialState: {items: getCartItems(req)}},
        context: {
          ...DEFAULT_CONTEXT,
          view: {
            url: new URL(
              req.originalUrl ?? req.url,
              `http://${req.headers.host ?? 'localhost'}`
            ).toString(),
          },
        }
        parameterManager: {
          initialState: {parameters: deserializeParameters(req)},
        },
      },
    });

    res.send(
      renderHtml(renderApp(staticState, '/search'), {
        type: 'search',
        staticState,
        navigatorContext,
      })
    );
  } catch (error) {
    console.error('Error fetching search static state:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/listing/:listingId', async (req, res) => {
  const {listingId} = req.params;
  if (!LISTING_IDS.has(listingId)) {
    res.status(404).send('Listing not found');
    return;
  }

  try {
    const navigatorContext = getNavigatorContext(req);
    listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

    const staticState = await listingEngineDefinition.fetchStaticState({
      controllers: {
        cart: {initialState: {items: getCartItems(req)}},
        context: {
          ...DEFAULT_CONTEXT,
          view: {
            url: new URL(
              req.originalUrl ?? req.url,
              `http://${req.headers.host ?? 'localhost'}`
            ).toString(),
          },
        }
        parameterManager: {
          initialState: {parameters: deserializeParameters(req)},
        },
      },
    });

    res.send(
      renderHtml(renderApp(staticState, `/listing/${listingId}`), {
        type: 'listing',
        staticState,
        navigatorContext,
      })
    );
  } catch (error) {
    console.error('Error fetching listing static state:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
