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
import {visitHome, visitListing, visitPrompt, type Visit} from './navigation.js';
import {HomePage} from './pages/HomePage.js';
import {ListingPage} from './pages/ListingPage.js';
import {PromptPage} from './pages/PromptPage.js';
import {
  useCart,
  useSessionSnapshot,
  useStorefrontSend,
  useViewSurfaces,
  type StorefrontView,
} from './session/storefront-session.js';

const catalog = createStorefrontCatalog();

/** The view a page's actions are sent on behalf of. A listing page draws no surface. */
function pageView(visit: Visit): StorefrontView {
  return visit.page === 'prompt' ? visit.view : 'storefront-preview-home';
}

/**
 * `NextActionsBar` follow-ups ask for a new answer: on a page's own surface they open a new
 * prompt visit on the assistant's view, and in a panel they are sent in that panel, on the page
 * that stays.
 */
const FOLLOW_UP_ACTION = 'selectAction';

/**
 * The Storefront Preview layout on one session: a header (the search box and the cart) that stays,
 * over a page (home, a prompt's answer or a listing) that changes.
 */
export function StorefrontApp() {
  const {sendPrompt, sendAction} = useStorefrontSend();
  const {a2uiMessages, request} = useSessionSnapshot();
  const {cart} = useCart();
  const viewSurfaces = useViewSurfaces();
  const [visit, setVisit] = useState<Visit>(visitHome);

  const visitRef = useRef(visit);
  visitRef.current = visit;
  const viewSurfacesRef = useRef(viewSurfaces);
  viewSurfacesRef.current = viewSurfaces;

  // A prompt page sends its prompt once per visit. StrictMode runs this effect twice; the visit id
  // keeps the second run from sending again. The home page has no prompt to send, and listing
  // pages have no view id in the published contract, so they send nothing.
  const sentVisitRef = useRef<number | null>(null);
  useEffect(() => {
    if (sentVisitRef.current === visit.id) {
      return;
    }
    sentVisitRef.current = visit.id;
    if (visit.page === 'prompt') {
      sendPrompt(visit.view, visit.prompt, visit.id);
    }
  }, [visit, sendPrompt]);

  // A follow-up comes from the agent, not the search box: it goes to the agent, whatever the
  // server's intent rule would make of its text.
  const openAssistant = useCallback(
    (prompt: string) => setVisit(visitPrompt(prompt, 'storefront-preview-assistant')),
    []
  );

  const handleAction = useCallback(
    (message: A2UIClientEventMessage) => {
      const userAction = (message as A2uiClientMessage).userAction;
      if (!userAction) {
        return;
      }
      const page = visitRef.current;
      // An action goes on the view that draws its surface: the page's results or its chat panel,
      // which share the visit.
      const view = viewSurfacesRef.current.viewOfSurface(userAction.surfaceId) ?? {
        visitId: page.id,
        view: pageView(page),
      };
      const text = userAction.context?.['text'];
      if (userAction.name === FOLLOW_UP_ACTION && typeof text === 'string') {
        const inPanel = view.visitId === page.id && view.view !== pageView(page);
        if (inPanel) {
          sendPrompt(view.view, text, view.visitId);
        } else {
          openAssistant(text);
        }
        return;
      }
      sendAction(view.view, message as A2uiClientMessage);
    },
    [sendPrompt, sendAction, openAssistant]
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
            onSearch={(query) => setVisit(visitPrompt(query))}
            searchDisabled={request !== undefined}
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
    case 'prompt':
      return (
        <PromptPage
          key={visit.id}
          prompt={visit.prompt}
          visitId={visit.id}
          view={visit.view}
          onBack={onHome}
        />
      );
    case 'listing':
      return <ListingPage slug={visit.slug} />;
  }
}
