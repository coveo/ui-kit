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
  threadOf,
  visitHome,
  visitListing,
  visitPrompt,
  visitResults,
  type Visit,
} from './navigation.js';
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
import {ASSISTANT_VIEW, drawsSearch, shopperText} from './views/view-surfaces.js';

const catalog = createStorefrontCatalog();

/** The view a page's actions are sent on behalf of. A listing page draws no surface. */
function pageView(visit: Visit): StorefrontView {
  return visit.page === 'prompt' ? visit.view : 'storefront-preview-home';
}

/**
 * `NextActionsBar` follow-ups ask for a new answer, and go to the agent. In the assistant's
 * conversation, on the assistant layout or in a panel, they are sent there, on the page that
 * stays; on a search layout's results they open a new prompt visit on the assistant's view, in
 * the same conversation.
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
  // The pages the shopper went through, the current one last: Back returns to the one before.
  const [history, setHistory] = useState<readonly Visit[]>(() => [visitHome()]);
  const visit = history[history.length - 1];
  // The conversation of every prompt visit, which outlives the history.
  const visitThreads = useRef(new Map<number, number>());

  const navigate = useCallback((next: Visit, {replace = false} = {}) => {
    const thread = threadOf(next);
    if (thread !== undefined) {
      visitThreads.current.set(next.id, thread);
    }
    setHistory((pages) => [...(replace ? pages.slice(0, -1) : pages), next]);
  }, []);
  const goBack = useCallback(() => setHistory((pages) => pages.slice(0, -1)), []);

  const visitRef = useRef(visit);
  visitRef.current = visit;
  const viewSurfacesRef = useRef(viewSurfaces);
  viewSurfacesRef.current = viewSurfaces;

  // A new page opens at its top, not where the chat before it was scrolled to.
  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, [visit.id]);

  // A prompt page sends its prompt once per visit, and not again when Back returns to it.
  // StrictMode runs this effect twice; the visit id keeps the second run from sending again. A
  // page that shows a conversation turn's search sends nothing, nor does the home page, which has
  // no prompt, and listing pages have no view id in the published contract.
  const sentVisits = useRef(new Set<number>());
  useEffect(() => {
    if (sentVisits.current.has(visit.id)) {
      return;
    }
    sentVisits.current.add(visit.id);
    if (visit.page === 'prompt' && visit.openingTurnId === undefined) {
      sendPrompt(visit.view, visit.prompt, visit.id);
    }
  }, [visit, sendPrompt]);

  // The answer to the page's prompt picks its layout (see `PromptPage`). On the assistant layout, a
  // later turn of the conversation that draws a search, such as a search option's, opens the
  // search layout: its results on the left, the conversation going on in the chat panel. Each turn
  // opens its search once: Back to the assistant layout stays there.
  const openedSearches = useRef(new Set<string>());
  useEffect(() => {
    if (visit.page !== 'prompt' || visit.openingTurnId !== undefined) {
      return;
    }
    const [answer, ...later] = viewSurfaces.turnsOfVisit(visit.id);
    const turn = later.findLast(drawsSearch);
    if (!answer || drawsSearch(answer) || !turn || openedSearches.current.has(turn.id)) {
      return;
    }
    openedSearches.current.add(turn.id);
    navigate(visitResults(shopperText(turn) ?? visit.prompt, visit.thread, turn.id));
  }, [visit, viewSurfaces, navigate]);

  const showResults = useCallback(
    (thread: number, turnId: string, query: string) =>
      navigate(visitResults(query, thread, turnId)),
    [navigate]
  );

  // A follow-up comes from the agent, not the search box: it goes to the agent, whatever the
  // server's intent rule would make of its text, and continues the page's conversation.
  const openAssistant = useCallback(
    (prompt: string) => navigate(visitPrompt(prompt, ASSISTANT_VIEW, threadOf(visitRef.current))),
    [navigate]
  );

  const handleAction = useCallback(
    (message: A2UIClientEventMessage) => {
      const userAction = (message as A2uiClientMessage).userAction;
      if (!userAction) {
        return;
      }
      const page = visitRef.current;
      // An action goes on the view that draws its surface: the search page's results or its chat
      // panel, which share the visit. The conversation goes on where it is shown: an action of a
      // turn asked on an earlier page of the conversation goes on this page.
      const drawnBy = viewSurfacesRef.current.viewOfSurface(userAction.surfaceId);
      const inConversation = viewSurfacesRef.current
        .conversationOf(visitsOfThread(visitThreads.current, threadOf(page)))
        .some(({response}) =>
          response.surfaces.some(({surfaceId}) => surfaceId === userAction.surfaceId)
        );
      const view =
        drawnBy && !inConversation
          ? drawnBy
          : {visitId: page.id, view: drawnBy?.view ?? pageView(page)};
      const text = userAction.context?.['text'];
      if (userAction.name === FOLLOW_UP_ACTION && typeof text === 'string') {
        if (inConversation) {
          sendPrompt(ASSISTANT_VIEW, text, page.id);
        } else {
          openAssistant(text);
        }
        return;
      }
      sendAction(view.view, message as A2uiClientMessage, view.visitId);
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
            onHome={() => navigate(visitHome())}
            onListing={(slug) => navigate(visitListing(slug))}
            // A search from the conversation's pages keeps the conversation in its panel.
            onSearch={(query) => navigate(visitPrompt(query, undefined, threadOf(visit)))}
            searchDisabled={request !== undefined}
          />
          <Page
            visit={visit}
            conversationVisits={visitsOfThread(visitThreads.current, threadOf(visit))}
            busy={request !== undefined}
            onSend={sendPrompt}
            onHome={() => navigate(visitHome())}
            onBack={history.length > 1 ? goBack : undefined}
            onShowResults={showResults}
          />
          <SessionInspector />
        </ThermidorA2UIStream>
      </ProductCardActionsContext.Provider>
    </A2UIProvider>
  );
}

function visitsOfThread(
  visitThreads: ReadonlyMap<number, number>,
  thread: number | undefined
): ReadonlySet<number> {
  return new Set(
    [...visitThreads].filter(([, visitThread]) => visitThread === thread).map(([id]) => id)
  );
}

interface PageProps {
  visit: Visit;
  /** The visits of the page's conversation, whose turns its chat shows. */
  conversationVisits: ReadonlySet<number>;
  busy: boolean;
  onSend(view: StorefrontView, prompt: string, visitId: number): void;
  onHome(): void;
  /** Returns to the previous page, if any. */
  onBack: (() => void) | undefined;
  onShowResults(thread: number, turnId: string, query: string): void;
}

function Page({visit, conversationVisits, busy, onSend, onHome, onBack, onShowResults}: PageProps) {
  switch (visit.page) {
    case 'home':
      return <HomePage />;
    case 'prompt':
      return (
        <PromptPage
          key={visit.id}
          prompt={visit.prompt}
          visitId={visit.id}
          openingTurnId={visit.openingTurnId}
          conversationVisits={conversationVisits}
          busy={busy}
          onSend={(prompt) => onSend(ASSISTANT_VIEW, prompt, visit.id)}
          onHome={onHome}
          onBack={onBack}
          onShowResults={(turnId, query) => onShowResults(visit.thread, turnId, query)}
        />
      );
    case 'listing':
      return <ListingPage slug={visit.slug} />;
  }
}
