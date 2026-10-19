import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import type {A2uiClientMessage} from '@coveo/thermidor';
import {ProductCardActionsContext} from '../../demo-schema-react/src/a2ui/ProductCard/product-card-actions.js';
import {toServerAction} from '../../demo-schema-react/src/a2ui/surface-stream.js';
import {ThermidorA2UIStream} from '../../demo-schema-react/src/a2ui/surfaces.js';
import {AddToCartButton} from './a2ui/AddToCartButton/AddToCartButton.js';
import {createStorefrontCatalog} from './a2ui/catalog.js';
import {StorefrontUiProvider, type StorefrontUi} from './a2ui/storefront-ui.js';
import {SessionInspector} from './components/SessionInspector.js';
import {TopBar} from './components/TopBar.js';
import {visitAssistant, visitHome, visitListing, visitSearch, type Visit} from './navigation.js';
import {AssistantPage} from './pages/AssistantPage.js';
import {HomePage} from './pages/HomePage.js';
import {ListingPage} from './pages/ListingPage.js';
import {SearchPage} from './pages/SearchPage.js';
import {useCart, useScheduler, useViewSurfaces} from './session/storefront-session.js';
import {ASSISTANT_CONTEXT, HOME_CONTEXT} from './session/turn-scheduler.js';

const catalog = createStorefrontCatalog();

/** `NextActionsBar` follow-ups ask for a new answer, so they open a new assistant visit. */
const FOLLOW_UP_ACTION = 'selectAction';

/**
 * The Storefront Preview layout on one session: a header (search-as-you-type suggestions and the
 * cart) that stays, over a page (home, assistant, search or a listing) that changes.
 */
export function StorefrontApp() {
  const scheduler = useScheduler();
  const views = useViewSurfaces();
  const {cart} = useCart();
  const [visit, setVisit] = useState<Visit>(visitHome);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const viewsRef = useRef(views);
  viewsRef.current = views;
  const visitRef = useRef(visit);
  visitRef.current = visit;

  // A page with a view id sends its prompt once per visit. StrictMode runs this effect twice; the
  // visit id keeps the second run from sending again. Search and listing pages have no view id in
  // the published contract, so they send nothing.
  const sentVisitRef = useRef<number | null>(null);
  useEffect(() => {
    if (sentVisitRef.current === visit.id) {
      return;
    }
    sentVisitRef.current = visit.id;
    if (visit.page === 'home') {
      scheduler.submitPagePrompt(HOME_CONTEXT, '', visit.id);
    } else if (visit.page === 'assistant') {
      scheduler.submitPagePrompt(ASSISTANT_CONTEXT, visit.prompt, visit.id);
    }
  }, [visit, scheduler]);

  const openAssistant = useCallback((prompt: string) => {
    setSuggestionsOpen(false);
    setVisit(visitAssistant(prompt));
  }, []);

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
      // Any other action goes to the server on behalf of the page. The session drops it unless
      // its surface belongs to the session's latest turn.
      scheduler.dispatchAction(
        visitRef.current.page === 'home' ? HOME_CONTEXT : ASSISTANT_CONTEXT,
        toServerAction(message, viewsRef.current.stream.serverSurfaceIds) as A2uiClientMessage
      );
    },
    [scheduler, openAssistant]
  );

  const ui = useMemo<StorefrontUi>(
    () => ({
      selectCompletion: (expression) => {
        scheduler.cancelSearch();
        openAssistant(expression);
      },
      addToCart: ({productId, name, price}) =>
        cart.apply({productId, name, price: price ?? null, quantity: 1, operation: 'add'}),
    }),
    [scheduler, openAssistant, cart]
  );

  const renderCardActions = useCallback(
    (product: Parameters<StorefrontUi['addToCart']>[0]) => (
      <AddToCartButton product={product} onAdd={ui.addToCart} />
    ),
    [ui]
  );

  return (
    <A2UIProvider catalog={catalog} onAction={handleAction}>
      <StorefrontUiProvider value={ui}>
        <ProductCardActionsContext.Provider value={renderCardActions}>
          <ThermidorA2UIStream
            messages={views.stream.messages}
            loadingSurfaces={views.stream.loadingSurfaces}
          >
            <TopBar
              currentListing={visit.page === 'listing' ? visit.slug : undefined}
              onHome={() => setVisit(visitHome())}
              onListing={(slug) => setVisit(visitListing(slug))}
              onSearch={(query, ai) => {
                setSuggestionsOpen(false);
                setVisit(ai ? visitAssistant(query) : visitSearch(query));
              }}
              suggestionsOpen={suggestionsOpen}
              onSuggestionsOpenChange={setSuggestionsOpen}
            />
            <Page visit={visit} onHome={() => setVisit(visitHome())} />
            <SessionInspector />
          </ThermidorA2UIStream>
        </ProductCardActionsContext.Provider>
      </StorefrontUiProvider>
    </A2UIProvider>
  );
}

function Page({visit, onHome}: {visit: Visit; onHome(): void}) {
  switch (visit.page) {
    case 'home':
      return <HomePage visitId={visit.id} />;
    case 'assistant':
      return (
        <AssistantPage key={visit.id} prompt={visit.prompt} visitId={visit.id} onBack={onHome} />
      );
    case 'search':
      return <SearchPage query={visit.query} />;
    case 'listing':
      return <ListingPage slug={visit.slug} />;
  }
}
