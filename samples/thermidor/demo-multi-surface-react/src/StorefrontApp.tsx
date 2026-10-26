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
import {visitAssistant, visitHome, visitListing, visitSearch, type Visit} from './navigation.js';
import {AssistantPage} from './pages/AssistantPage.js';
import {HomePage} from './pages/HomePage.js';
import {ListingPage} from './pages/ListingPage.js';
import {SearchPage} from './pages/SearchPage.js';
import {useCart, useScheduler, useSessionSnapshot} from './session/storefront-session.js';
import {
  ASSISTANT_CONTEXT,
  HOME_CONTEXT,
  SEARCH_CONTEXT,
  type StorefrontContext,
} from './session/turn-scheduler.js';

const catalog = createStorefrontCatalog();

/** The view a page's actions are sent on behalf of. A listing page draws no surface. */
const PAGE_CONTEXTS: Record<Visit['page'], StorefrontContext> = {
  home: HOME_CONTEXT,
  assistant: ASSISTANT_CONTEXT,
  search: SEARCH_CONTEXT,
  listing: HOME_CONTEXT,
};

/** `NextActionsBar` follow-ups ask for a new answer, so they open a new assistant visit. */
const FOLLOW_UP_ACTION = 'selectAction';

/**
 * The Storefront Preview layout on one session: a header (the search box and the cart) that stays,
 * over a page (home, assistant, search or a listing) that changes.
 */
export function StorefrontApp() {
  const scheduler = useScheduler();
  const {a2uiMessages} = useSessionSnapshot();
  const {cart} = useCart();
  const [visit, setVisit] = useState<Visit>(visitHome);

  const visitRef = useRef(visit);
  visitRef.current = visit;

  // The assistant and search pages send their prompt once per visit. StrictMode runs this effect
  // twice; the visit id keeps the second run from sending again. The home page has no prompt to
  // send, and listing pages have no view id in the published contract, so they send nothing.
  const sentVisitRef = useRef<number | null>(null);
  useEffect(() => {
    if (sentVisitRef.current === visit.id) {
      return;
    }
    sentVisitRef.current = visit.id;
    if (visit.page === 'assistant') {
      scheduler.submitPagePrompt(ASSISTANT_CONTEXT, visit.prompt, visit.id);
    } else if (visit.page === 'search') {
      scheduler.submitPagePrompt(SEARCH_CONTEXT, visit.query, visit.id);
    } else {
      scheduler.leavePage();
    }
  }, [visit, scheduler]);

  const openAssistant = useCallback((prompt: string) => setVisit(visitAssistant(prompt)), []);

  const handleAction = useCallback(
    (message: A2UIClientEventMessage) => {
      const userAction = (message as A2uiClientMessage).userAction;
      if (!userAction) {
        return;
      }
      const text = userAction.context?.['text'];
      if (userAction.name === FOLLOW_UP_ACTION && typeof text === 'string') {
        openAssistant(text);
        return;
      }
      scheduler.dispatchAction(PAGE_CONTEXTS[visitRef.current.page], message as A2uiClientMessage);
    },
    [scheduler, openAssistant]
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
            currentListing={visit.page === 'listing' ? visit.slug : undefined}
            onHome={() => setVisit(visitHome())}
            onListing={(slug) => setVisit(visitListing(slug))}
            onSearch={(query, ai) => setVisit(ai ? visitAssistant(query) : visitSearch(query))}
          />
          <Page visit={visit} onHome={() => setVisit(visitHome())} />
          <SessionInspector />
        </ThermidorA2UIStream>
      </ProductCardActionsContext.Provider>
    </A2UIProvider>
  );
}

function Page({visit, onHome}: {visit: Visit; onHome(): void}) {
  switch (visit.page) {
    case 'home':
      return <HomePage />;
    case 'assistant':
      return (
        <AssistantPage key={visit.id} prompt={visit.prompt} visitId={visit.id} onBack={onHome} />
      );
    case 'search':
      return <SearchPage key={visit.id} query={visit.query} visitId={visit.id} />;
    case 'listing':
      return <ListingPage slug={visit.slug} />;
  }
}
