import {useCallback, useEffect, useRef, useState} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import type {A2uiClientMessage} from '@coveo/thermidor';
import {
  ProductCardActionsContext,
  type ProductCardProduct,
} from '../../demo-schema-react/src/a2ui/ProductCard/product-card-actions.js';
import {ThermidorA2UIStream} from '../../demo-schema-react/src/a2ui/surfaces.js';
import {AddToCartButton} from './a2ui/AddToCartButton/AddToCartButton.js';
import {createStorefrontCatalog} from './a2ui/catalog.js';
import {SessionInspector} from './components/SessionInspector.js';
import {TopBar} from './components/TopBar.js';
import {listingName, pageFromUrl, pageName, urlOf, type Page} from './navigation.js';
import {AssistantPage} from './pages/AssistantPage.js';
import {HomePage} from './pages/HomePage.js';
import {ListingPage} from './pages/ListingPage.js';
import {SearchPage} from './pages/SearchPage.js';
import {usePageView} from './pages/use-page-view.js';
import {useCart, useScheduler, useSessionSnapshot} from './session/storefront-session.js';
import {
  ASSISTANT_CONTEXT,
  HOME_CONTEXT,
  SEARCH_CONTEXT,
  type StorefrontContext,
  type TurnScheduler,
} from './session/turn-scheduler.js';

const catalog = createStorefrontCatalog();

/**
 * The view a page sends its requests on. The published contract has no view id for listings, so a
 * listing sends its category as a search.
 */
const PAGE_CONTEXTS: Record<Page['page'], StorefrontContext> = {
  home: HOME_CONTEXT,
  assistant: ASSISTANT_CONTEXT,
  search: SEARCH_CONTEXT,
  listing: SEARCH_CONTEXT,
};

/** `NextActionsBar` follow-ups ask for a new answer, so they open a new assistant page. */
const FOLLOW_UP_ACTION = 'selectAction';

/** The page shown, and whether the shopper opened it or came back to it with the browser. */
interface Shown {
  page: Page;
  revisited: boolean;
  /** Counts the pages shown, so a page shown again starts from scratch. */
  key: number;
}

/**
 * Sends the prompt of a page being shown. A search or listing page shown again names the surface
 * its URL holds, and the server sends that surface again with its state. The server cannot restore
 * an assistant answer yet, so an answer the shopper comes back to sends nothing; neither does the
 * home page.
 */
function showPage(scheduler: TurnScheduler, {page, revisited}: Omit<Shown, 'key'>): void {
  switch (page.page) {
    case 'home':
      scheduler.leavePage();
      return;
    case 'assistant':
      if (revisited) {
        scheduler.leavePage();
      } else {
        scheduler.submitPagePrompt(ASSISTANT_CONTEXT, page.prompt);
      }
      return;
    case 'search':
      scheduler.submitPagePrompt(SEARCH_CONTEXT, page.query, page.surface);
      return;
    case 'listing':
      scheduler.submitPagePrompt(SEARCH_CONTEXT, listingName(page.slug), page.surface);
      return;
  }
}

const currentUrlPage = () => pageFromUrl(window.location);

/**
 * The Storefront Preview layout on one session: a header (the search box and the cart) that stays,
 * over a page (home, assistant, search or a listing) that changes. The URL names the page, and the
 * browser keeps the history.
 */
export function StorefrontApp() {
  const scheduler = useScheduler();
  const {a2uiMessages} = useSessionSnapshot();
  const {cart} = useCart();
  const pageView = usePageView();
  const [shown, setShown] = useState<Shown>(() => ({
    page: currentUrlPage(),
    revisited: false,
    key: 0,
  }));
  const page = shown.page;

  // A page sends its prompt as it is shown, so the page turn is never another page's. The first
  // page is shown once the app mounts; StrictMode runs this effect twice, the ref sends it once.
  const startedRef = useRef(false);
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      showPage(scheduler, {page: currentUrlPage(), revisited: false});
    }
  }, [scheduler]);

  const show = useCallback(
    (next: Omit<Shown, 'key'>) => {
      showPage(scheduler, next);
      setShown((current) => ({...next, key: current.key + 1}));
    },
    [scheduler]
  );

  const open = useCallback(
    (next: Page) => {
      window.history.pushState(null, '', urlOf(next));
      show({page: next, revisited: false});
    },
    [show]
  );

  useEffect(() => {
    const onPopState = () => show({page: currentUrlPage(), revisited: true});
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [show]);

  // The URL names the search surface the page's turn created: the one it restored, or a new one
  // when the server no longer had it.
  const {searchSurfaceId} = pageView;
  useEffect(() => {
    if (
      (page.page === 'search' || page.page === 'listing') &&
      searchSurfaceId &&
      searchSurfaceId !== page.surface
    ) {
      const withSurface = {...page, surface: searchSurfaceId};
      window.history.replaceState(null, '', urlOf(withSurface));
      setShown((current) => ({...current, page: withSurface}));
    }
  }, [page, searchSurfaceId]);

  useEffect(() => {
    document.title = `${pageName(page)} · Storefront Preview`;
  }, [page]);

  const pageRef = useRef(page);
  pageRef.current = page;

  const handleAction = useCallback(
    (message: A2UIClientEventMessage) => {
      const userAction = (message as A2uiClientMessage).userAction;
      if (!userAction) {
        return;
      }
      const text = userAction.context?.['text'];
      if (userAction.name === FOLLOW_UP_ACTION && typeof text === 'string') {
        open({page: 'assistant', prompt: text});
        return;
      }
      scheduler.dispatchAction(PAGE_CONTEXTS[pageRef.current.page], message as A2uiClientMessage);
    },
    [scheduler, open]
  );

  const addToCart = useCallback(
    ({productId, name, price}: ProductCardProduct) =>
      cart.apply({productId, name, price: price ?? null, quantity: 1, operation: 'add'}),
    [cart]
  );

  const renderCardActions = useCallback(
    (product: ProductCardProduct) => <AddToCartButton product={product} onAdd={addToCart} />,
    [addToCart]
  );

  return (
    <A2UIProvider catalog={catalog} onAction={handleAction}>
      <ProductCardActionsContext.Provider value={renderCardActions}>
        <ThermidorA2UIStream messages={a2uiMessages}>
          <TopBar
            currentListing={page.page === 'listing' ? page.slug : undefined}
            onHome={() => open({page: 'home'})}
            onListing={(slug) => open({page: 'listing', slug})}
            onSearch={(query, ai) =>
              open(ai ? {page: 'assistant', prompt: query} : {page: 'search', query})
            }
          />
          <PageOf key={shown.key} page={page} revisited={shown.revisited} />
          <SessionInspector />
        </ThermidorA2UIStream>
      </ProductCardActionsContext.Provider>
    </A2UIProvider>
  );
}

function PageOf({page, revisited}: {page: Page; revisited: boolean}) {
  switch (page.page) {
    case 'home':
      return <HomePage />;
    case 'assistant':
      return <AssistantPage prompt={page.prompt} revisited={revisited} />;
    case 'search':
      return <SearchPage query={page.query} />;
    case 'listing':
      return <ListingPage slug={page.slug} />;
  }
}
