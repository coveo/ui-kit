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
import {
  currentVisit,
  goBack,
  listingName,
  pageName,
  previousVisit,
  pushVisit,
  startHistory,
  visitAssistant,
  visitHome,
  visitListing,
  visitSearch,
  type Visit,
} from './navigation.js';
import {AssistantPage} from './pages/AssistantPage.js';
import {HomePage} from './pages/HomePage.js';
import {ListingPage} from './pages/ListingPage.js';
import {SearchPage} from './pages/SearchPage.js';
import {
  useCart,
  useScheduler,
  useSessionSnapshot,
  useViewSurfaces,
} from './session/storefront-session.js';
import {
  ASSISTANT_CONTEXT,
  HOME_CONTEXT,
  SEARCH_CONTEXT,
  type StorefrontContext,
} from './session/turn-scheduler.js';

const catalog = createStorefrontCatalog();

/**
 * The view a page sends its requests on. The published contract has no view id for listings, so a
 * listing sends its category as a search.
 */
const PAGE_CONTEXTS: Record<Visit['page'], StorefrontContext> = {
  home: HOME_CONTEXT,
  assistant: ASSISTANT_CONTEXT,
  search: SEARCH_CONTEXT,
  listing: SEARCH_CONTEXT,
};

/** The prompt a page sends when it is first shown: a listing sends its category as a search. */
function pagePrompt(visit: Visit): string | undefined {
  switch (visit.page) {
    case 'home':
      return undefined;
    case 'assistant':
      return visit.prompt;
    case 'search':
      return visit.query;
    case 'listing':
      return listingName(visit.slug);
  }
}

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
  const viewSurfaces = useViewSurfaces();
  const [history, setHistory] = useState(startHistory);
  const visit = currentVisit(history);

  const visitRef = useRef(visit);
  visitRef.current = visit;
  const viewSurfacesRef = useRef(viewSurfaces);
  viewSurfacesRef.current = viewSurfaces;

  // A page sends its prompt the first time its visit is shown. Going back shows a visit again,
  // with the surfaces the session kept, so it sends nothing; like a page with no prompt, it drops
  // the prompt still waiting for the page it left. StrictMode runs this effect twice; the shown
  // visit id keeps the second run from doing anything.
  const shownVisitRef = useRef<number | null>(null);
  const sentVisitsRef = useRef(new Set<number>());
  useEffect(() => {
    if (shownVisitRef.current === visit.id) {
      return;
    }
    shownVisitRef.current = visit.id;
    const prompt = pagePrompt(visit);
    if (prompt === undefined || sentVisitsRef.current.has(visit.id)) {
      scheduler.leavePage();
      return;
    }
    sentVisitsRef.current.add(visit.id);
    scheduler.submitPagePrompt(PAGE_CONTEXTS[visit.page], prompt, visit.id);
  }, [visit, scheduler]);

  const open = useCallback((next: Visit) => setHistory((current) => pushVisit(current, next)), []);
  const back = useCallback(() => setHistory(goBack), []);
  const openAssistant = useCallback((prompt: string) => open(visitAssistant(prompt)), [open]);

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
      // An action belongs to the visit whose turn created its surface, which may be an earlier
      // page shown again, so it goes on that turn's view.
      const turn = viewSurfacesRef.current.turnOfSurface(userAction.surfaceId);
      const context =
        (turn && scheduler.turnContexts.get(turn.id)) ?? PAGE_CONTEXTS[visitRef.current.page];
      scheduler.dispatchAction(context, message as A2uiClientMessage);
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
            onHome={() => open(visitHome())}
            onListing={(slug) => open(visitListing(slug))}
            onSearch={(query, ai) => open(ai ? visitAssistant(query) : visitSearch(query))}
          />
          <Page visit={visit} previous={previousVisit(history)} onBack={back} />
          <SessionInspector />
        </ThermidorA2UIStream>
      </ProductCardActionsContext.Provider>
    </A2UIProvider>
  );
}

interface PageProps {
  visit: Visit;
  /** The visit Back returns to. */
  previous: Visit | undefined;
  onBack(): void;
}

function Page({visit, previous, onBack}: PageProps) {
  switch (visit.page) {
    case 'home':
      return <HomePage />;
    case 'assistant':
      return (
        <AssistantPage
          key={visit.id}
          prompt={visit.prompt}
          visitId={visit.id}
          backTo={previous && pageName(previous)}
          onBack={onBack}
        />
      );
    case 'search':
      return <SearchPage key={visit.id} query={visit.query} visitId={visit.id} />;
    case 'listing':
      return <ListingPage key={visit.id} slug={visit.slug} visitId={visit.id} />;
  }
}
