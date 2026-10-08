import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {A2UIProvider, type A2UIClientEventMessage} from '@copilotkit/a2ui-renderer';
import type {A2uiClientMessage} from '@coveo/thermidor';
import type {UpdateCartPayload} from '@coveo/thermidor-schema';
import {ProductCardActionsContext} from '../../demo-schema-react/src/a2ui/ProductCard/product-card-actions.js';
import {ThermidorA2UIStream} from '../../demo-schema-react/src/a2ui/surfaces.js';
import {createStorefrontCatalog} from './a2ui/catalog.js';
import {AddToCartButton} from './a2ui/AddToCartButton/AddToCartButton.js';
import {StorefrontUiProvider, type StorefrontUi} from './a2ui/storefront-ui.js';
import {SessionInspector} from './components/SessionInspector.js';
import {TopBar} from './components/TopBar.js';
import {findSurfaceByRoot, SLOTS} from './layout/surface-layout.js';
import {visitAssistant, visitHome, type Visit} from './navigation.js';
import {AssistantPage} from './pages/AssistantPage.js';
import {HomePage} from './pages/HomePage.js';
import {
  useCart,
  useScheduler,
  useSession,
  useSurfaceLayout,
  useTurns,
} from './session/storefront-session.js';
import {
  ASSISTANT_CONTEXT,
  HOME_CONTEXT,
  SHELL_CONTEXT,
  type StorefrontContext,
} from './session/turn-scheduler.js';

const catalog = createStorefrontCatalog();

/** `NextActionsBar` actions ask for a new answer, so they open a new assistant visit. */
const FOLLOW_UP_ACTIONS = new Set(['selectAction', 'selectSearchOption']);

const HEADER_SLOTS = new Set<string>([SLOTS.headerSuggestions, SLOTS.headerCart]);

interface PageTurn {
  visitId: number;
  sinceTurnIndex: number;
  turnId: string | undefined;
}

/**
 * The Storefront Preview layout on one session: a header (search-as-you-type suggestions and the
 * cart) that stays, over a page (home or assistant) that changes.
 */
export function StorefrontApp() {
  const session = useSession();
  const scheduler = useScheduler();
  const turns = useTurns();
  const layout = useSurfaceLayout();
  const {cart} = useCart();
  const [visit, setVisit] = useState<Visit>(visitHome);
  const [pageTurn, setPageTurn] = useState<PageTurn | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const visitRef = useRef(visit);
  visitRef.current = visit;

  // A page submits its own prompt once per visit. StrictMode runs this effect twice; the visit
  // id keeps the second run from submitting again.
  const submittedVisitRef = useRef<number | null>(null);
  useEffect(() => {
    if (submittedVisitRef.current === visit.id) {
      return;
    }
    submittedVisitRef.current = visit.id;
    const sinceTurnIndex = session.turns.length;
    if (visit.page === 'home') {
      scheduler.submitPagePrompt(HOME_CONTEXT, '');
    } else {
      scheduler.submitPagePrompt(ASSISTANT_CONTEXT, visit.prompt);
    }
    setPageTurn({visitId: visit.id, sinceTurnIndex, turnId: session.turns[sinceTurnIndex]?.id});
  }, [visit, session, scheduler]);

  const openAssistant = useCallback((prompt: string) => {
    setSuggestionsOpen(false);
    setVisit(visitAssistant(prompt));
  }, []);

  const contextOfSurface = useCallback((surfaceId: string): StorefrontContext => {
    const surface = layoutRef.current.surfaces.find(
      (candidate) => candidate.surfaceId === surfaceId
    );
    if (surface?.slot && HEADER_SLOTS.has(surface.slot)) {
      return SHELL_CONTEXT;
    }
    return visitRef.current.page === 'home' ? HOME_CONTEXT : ASSISTANT_CONTEXT;
  }, []);

  const handleAction = useCallback(
    (message: A2UIClientEventMessage | A2uiClientMessage) => {
      const userAction = (message as A2uiClientMessage).userAction;
      if (!userAction) {
        return;
      }
      if (FOLLOW_UP_ACTIONS.has(userAction.name)) {
        const text = userAction.context?.['text'];
        if (typeof text === 'string') {
          openAssistant(text);
        }
        return;
      }
      if (userAction.name === 'updateCart') {
        cart.apply(userAction.context as UpdateCartPayload);
      }
      scheduler.dispatchAction(
        contextOfSurface(userAction.surfaceId),
        message as A2uiClientMessage
      );
    },
    [cart, scheduler, contextOfSurface, openAssistant]
  );

  const ui = useMemo<StorefrontUi>(
    () => ({
      selectCompletion: (expression) => {
        scheduler.cancelSearch();
        openAssistant(expression);
      },
      addToCart: ({productId, name, price}) => {
        const payload: UpdateCartPayload = {
          productId,
          name,
          price: price ?? null,
          quantity: 1,
          operation: 'add',
        };
        // The product is on another surface, but the action belongs to the cart, so it is
        // addressed to whichever surface the server rooted on a `Cart`.
        const cartSurface = findSurfaceByRoot(layoutRef.current, 'Cart');
        if (!cartSurface) {
          cart.apply(payload);
          return;
        }
        handleAction({
          userAction: {
            name: 'updateCart',
            surfaceId: cartSurface.surfaceId,
            sourceComponentId: 'root',
            context: payload,
          },
        });
      },
    }),
    [scheduler, openAssistant, cart, handleAction]
  );

  const renderCardActions = useCallback(
    (product: Parameters<StorefrontUi['addToCart']>[0]) => (
      <AddToCartButton product={product} onAdd={ui.addToCart} />
    ),
    [ui]
  );

  const currentPageTurn = pageTurn?.visitId === visit.id ? pageTurn : null;
  const sinceTurnIndex = currentPageTurn?.sinceTurnIndex ?? turns.length;
  const assistantTurn = turns.find((turn) => turn.id === currentPageTurn?.turnId);

  return (
    <A2UIProvider catalog={catalog} onAction={handleAction}>
      <StorefrontUiProvider value={ui}>
        <ProductCardActionsContext.Provider value={renderCardActions}>
          <ThermidorA2UIStream messages={layout.messages} />
          <TopBar
            onHome={() => setVisit(visitHome())}
            onSearch={openAssistant}
            suggestionsOpen={suggestionsOpen}
            onSuggestionsOpenChange={setSuggestionsOpen}
          />
          {visit.page === 'home' ? (
            <HomePage sinceTurnIndex={sinceTurnIndex} />
          ) : (
            <AssistantPage
              key={visit.id}
              prompt={visit.prompt}
              sinceTurnIndex={sinceTurnIndex}
              turn={assistantTurn}
              onBack={() => setVisit(visitHome())}
            />
          )}
          <SessionInspector />
        </ProductCardActionsContext.Provider>
      </StorefrontUiProvider>
    </A2UIProvider>
  );
}
