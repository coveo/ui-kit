/**
 * The scenarios the use-case player replays, through the page's own controls, as a shopper would.
 * There is one per use case of the use-case sheet, in the group of its tab ("Multi-surface" or
 * "Other use cases"), titled and described in its words; its status says how far the sample gets
 * today on the real service: the public demo organization (`pnpm dev`), with intent routing on,
 * played twice. A use case the sample cannot replay has no steps. The edge checks guard the rules
 * between surfaces that no use case names on its own.
 */

export type Step =
  /** Types `text` in the header search box and submits it. */
  | {kind: 'omnibox'; text: string}
  /** Types `text` in the header search box without submitting it. */
  | {kind: 'type'; text: string}
  /**
   * Asks `text` in the shopping assistant's panel, or in the conversation on the assistant layout,
   * which is itself the chat.
   */
  | {kind: 'panel'; text: string}
  /** Selects a value of a facet of the results. */
  | {kind: 'facet'; value: string}
  /** Opens a listing page from the header's listing menu. */
  | {kind: 'listing'; name: string}
  /** Picks the follow-up action of the agent's last answer that starts with `text`, or its first. */
  | {kind: 'chip'; text?: string}
  /** Adds the first product card on the page to the cart. */
  | {kind: 'cart'}
  /** Goes back to the storefront's home page. */
  | {kind: 'home'};

export type UseCaseStatus =
  | {state: 'ready'; note?: string}
  | {state: 'partly'; note: string}
  | {state: 'not-ready'; note: string};

export type UseCaseGroup = 'multi-surface' | 'other' | 'edge';

export interface UseCase {
  id: string;
  group: UseCaseGroup;
  title: string;
  /** What the shopper sees, as the use case states it. */
  expected: string;
  /** What the steps check on top of it. */
  checks: string[];
  status: UseCaseStatus;
  /** None when the sample cannot replay the use case; its status says why. */
  steps: Step[];
  /** How the steps differ from the sheet's example shopper input, if they do. */
  stepsNote?: string;
  /** Ids of other use cases this scenario touches. */
  related?: string[];
}

export const GROUP_LABELS: Record<UseCaseGroup, string> = {
  'multi-surface': 'Multi-surface',
  other: 'Other use cases',
  edge: 'Edge checks',
};

export const USE_CASE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/18MNf__WtVYOiyQerR5zsvK6l-DH3XYf8jK9yrOp6SvM';

const CHEAPEST: Step = {kind: 'panel', text: 'Which is the cheapest?'};

const NEEDS_AGENT_DIRECTIVE =
  'The agent cannot change the results next to the panel: the service has no agent directive yet. The agent answers in the panel and the results stay as they are.';

export const USE_CASES: readonly UseCase[] = [
  {
    id: 'UC-04',
    group: 'multi-surface',
    title: 'UC-04 · Search with no results hands over to the conversation',
    expected:
      'Instead of a zero-result page, the conversation picks up the query. For broad queries with very few results, the panel can offer help ("Want help narrowing this down?").',
    checks: ['A panel question after the empty search is not about the empty results.'],
    status: {
      state: 'partly',
      note: 'Intent routing sends "snow shovel" to the agent, which says the catalog has none and offers other searches: the conversation picks the query up, but by routing, not as a hand-over from an empty results page, and nothing offers help for a broad query with few results. The panel question is then about snow shovels, not empty results.',
    },
    steps: [{kind: 'omnibox', text: 'snow shovel'}, CHEAPEST],
  },
  {
    id: 'UC-06',
    group: 'multi-surface',
    title: 'UC-06 · Results stacked in the conversation or side by side',
    expected: 'The search layout can be shown inline in the conversation thread, or next to it.',
    checks: [
      'Products the agent shows in the thread sit next to the kayaks results.',
      '"Which of these" after them means the products in the thread, not the kayaks.',
      'A question about the kayak results on the left is answered from the search grid, not the thread.',
    ],
    status: {
      state: 'partly',
      note: 'Products the agent shows sit in the panel’s thread next to the kayak results, and “which of these” means them: the cheapest life jacket. A question about the kayak results on the left is then answered from the grid: the Orangetouring Kayak at $720. Both in 2 of 2 runs. The search layout itself (grid and facets) is never drawn inside the thread: a search opens next to it.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Show me 3 life jackets with their prices'},
      {kind: 'panel', text: 'Which of these is the cheapest?'},
      {
        kind: 'panel',
        text: 'And in the kayak results on the left, which kayak is the cheapest?',
      },
    ],
  },
  {
    id: 'UC-07',
    group: 'multi-surface',
    title: 'UC-07 · Collapsible chat panel on the results page',
    expected:
      'An AI button opens a conversational panel that slides in over the results. Closing it keeps the conversation, and reopening it continues where the shopper left off.',
    checks: [
      'The panel opens next to the results and its question is about them.',
      'A second question continues the same conversation.',
    ],
    status: {
      state: 'partly',
      note: 'The panel is always open next to the results and keeps the conversation; there is no AI button, and it cannot be closed or reopened. In 1 of 2 runs, its first question got no prices from the results (“I don’t have pricing information”).',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      CHEAPEST,
      {kind: 'panel', text: 'Are these kayaks good for rivers?'},
    ],
  },
  {
    id: 'UC-08',
    group: 'multi-surface',
    title: 'UC-08 · Conversation knows what the shopper did on the listing',
    expected:
      'The assistant sees the current query, facets and results. If the panel was closed while the shopper kept searching, it resumes aware of what changed.',
    checks: [
      'After the HO Sports facet, the cheapest is an HO Sports kayak, not the $720 kayaks of the other brands.',
      'After a listing page, the cheapest is from that listing.',
      'After another header search, the cheapest is from the surfboards.',
    ],
    status: {
      state: 'partly',
      note: 'The agent follows the search on screen only in part, in 2 of 2 runs: after the HO Sports facet it still names the $720 Orangetouring, not an HO Sports kayak; on the Surfing listing it sees surfing products but names no cheapest; after the surfboards search it names the cheapest of those results.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Are these kayaks good for rivers?'},
      {kind: 'facet', value: 'HO Sports'},
      CHEAPEST,
      {kind: 'listing', name: 'Surfing'},
      CHEAPEST,
      {kind: 'omnibox', text: 'surfboards'},
      CHEAPEST,
    ],
    related: ['UC-28'],
  },
  {
    id: 'UC-09',
    group: 'multi-surface',
    title: 'UC-09 · From the grid into the conversation',
    expected:
      'A question asked from the results moves into a conversational layout about those results.',
    checks: ['The question asked next to the results is answered about those results.'],
    status: {
      state: 'partly',
      note: 'The question goes to the panel next to the results, with no switch to a conversational layout. The agent could not answer it from those results in 2 of 2 runs (once it had none of their details, once no terrain data); the next question, the cheapest, was answered from them.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Which of these is best for rocky terrain?'},
      CHEAPEST,
    ],
  },
  {
    id: 'UC-10',
    group: 'multi-surface',
    title: 'UC-10 · From the conversation back to the grid, refinements kept',
    expected:
      'Returns to full search results with the refinements from the conversation applied, and a clear way back to the conversation.',
    checks: [
      'The results get the price range the conversation discussed.',
      'The next question is about the refined results.',
    ],
    status: {state: 'not-ready', note: NEEDS_AGENT_DIRECTIVE},
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Which kayaks under $800 would you recommend?'},
      {kind: 'panel', text: 'Just show me the results as a normal grid'},
      CHEAPEST,
    ],
  },
  {
    id: 'UC-11',
    group: 'multi-surface',
    title: 'UC-11 · Natural-language refinement of the grid',
    expected:
      'The agent turns the request into facet, filter and sort changes on the active results, shown in the search UI.',
    checks: [
      'The results next to the panel get the price range, in place.',
      'The next question is about the refined results.',
    ],
    status: {state: 'not-ready', note: NEEDS_AGENT_DIRECTIVE},
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Only show me ones under $800'},
      CHEAPEST,
    ],
  },
  {
    id: 'UC-12',
    group: 'multi-surface',
    title: 'UC-12 · Agent explains and can undo its search changes',
    expected:
      'After changing the search, the agent says what it changed and why. The shopper can undo it in one action.',
    checks: [
      'After "undo that", the results are back to all the kayaks.',
      'The next question is about them.',
    ],
    status: {state: 'not-ready', note: NEEDS_AGENT_DIRECTIVE},
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Only show me ones under $800'},
      {kind: 'panel', text: 'Undo that'},
      CHEAPEST,
    ],
  },
  {
    id: 'UC-24',
    group: 'multi-surface',
    title: 'UC-24 · Query and product suggestions while typing',
    expected:
      'Query suggestions and product suggestions appear as the shopper types, tolerant of partial SKUs.',
    checks: ['Suggestions show under the header search box while typing.'],
    status: {
      state: 'not-ready',
      note: "The sample's header search box has no suggestions.",
    },
    steps: [{kind: 'type', text: 'kay'}],
  },
  {
    id: 'UC-30',
    group: 'multi-surface',
    title: 'UC-30 · Home page recommendations',
    expected: 'A product carousel on the home page (surface storefront-preview-home).',
    checks: [
      'The home page shows a carousel of its own.',
      'A question about "these" from the home page is about that carousel.',
    ],
    status: {
      state: 'not-ready',
      note: 'The home page sends no request (the service has nothing to answer storefront-preview-home with), so it has no carousel; the panel there answers a recommendation with a carousel in its thread.',
    },
    steps: [
      {kind: 'home'},
      {kind: 'panel', text: 'Recommend some popular gifts under $50'},
      {kind: 'panel', text: 'Which of these is the cheapest?'},
    ],
    related: ['UC-29'],
  },
  {
    id: 'UC-31',
    group: 'multi-surface',
    title: 'UC-31 · Cart and suggestions in the header',
    expected:
      'Query suggestions and the cart in the storefront header (surface storefront-preview).',
    checks: [
      'The header cart counts a product added from the results.',
      'Query suggestions show under the header search box while typing.',
    ],
    status: {
      state: 'partly',
      note: 'The header cart counts a product added from the agent’s carousel, in 2 of 2 runs (the search results have no Add to cart). Typing shows no suggestions: the header box sends nothing while typing (as for UC-24).',
    },
    steps: [
      {kind: 'omnibox', text: 'I want to see yellow paddleboard options under $1,000'},
      {kind: 'cart'},
      {kind: 'type', text: 'kay'},
    ],
    stepsNote:
      'The sheet gives no example: the steps add a paddleboard from the agent’s answer (the search results have no Add to cart), then type.',
    related: ['UC-24'],
  },
  {
    id: 'UC-34',
    group: 'multi-surface',
    title: 'UC-34 · Conversation edits the cart, using the listing',
    expected:
      'From the chat panel next to the listing, the shopper asks the assistant to add, remove or swap cart items, referring to products on the listing. The cart in the header updates and the agent confirms what changed.',
    checks: ['The header cart gets the first two kayaks of the results.'],
    status: {
      state: 'not-ready',
      note: 'The agent names the top two kayaks but says it cannot add items to the cart: the service has no agent directive for the cart yet.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Add the top two results to my cart'},
    ],
  },
  {
    id: 'UC-01',
    group: 'other',
    title: 'UC-01 · Keyword query gets classic search results',
    expected:
      'Short or transactional queries (brand, SKU, category, product name) render a product grid at search speed, with no model call.',
    checks: [
      'The search layout opens with a product grid.',
      'The answer is a search, back at search speed, with no agent reasoning.',
    ],
    status: {
      state: 'ready',
      note: '“kayak paddle” opens the search layout (44 products, facets, sort, pagination) in under half a second, with no agent turn: no reasoning, tool call or answer text, in 2 of 2 runs. Whether the service’s intent routing calls a model is not visible from the sample.',
    },
    steps: [{kind: 'omnibox', text: 'kayak paddle'}],
    stepsNote:
      'The sheet’s example, “waterproof trail runners”, is not in this water sports catalog: the steps search “kayak paddle”.',
  },
  {
    id: 'UC-02',
    group: 'other',
    title: 'UC-02 · Question in the same box goes to the assistant',
    expected:
      'The box switches to AI mode when the query reads like a question, uses words like compare or bundle, or is long. The shopper can also flip the Search / Ask toggle by hand.',
    checks: [
      'A question with no “?” opens the assistant layout with the agent’s answer.',
      'A request with “compare” goes to the agent too.',
    ],
    status: {
      state: 'partly',
      note: 'With no “?”, “which paddle should I get for a touring kayak” opens the assistant layout with the agent’s answer (a comparison table or a product research card), and “compare touring kayaks” gets a comparison table, in 2 of 2 runs. The switch is automatic: there is no Search / Ask toggle to flip by hand.',
    },
    steps: [
      {kind: 'omnibox', text: 'which paddle should I get for a touring kayak'},
      {kind: 'omnibox', text: 'compare touring kayaks'},
    ],
    stepsNote:
      'The sheet’s example, “which servo motor is compatible with the R-20 series”, is for a robotics catalog: the steps ask about paddles and kayaks.',
  },
  {
    id: 'UC-03',
    group: 'other',
    title: 'UC-03 · Query suggestions decide ambiguous queries',
    expected:
      'Strong, specific suggestions route to search. Weak or no suggestions route to the conversation.',
    checks: ['Where the ambiguous query goes, and whether query suggestions decided it.'],
    status: {
      state: 'partly',
      note: '“kayak rocky rivers” goes to the agent in 2 of 2 runs, which answers with whitewater kayaks. The service’s intent routing decides: nothing shows that query suggestions decide it (the agent asks for suggestions only after the routing), and the header box shows none.',
    },
    steps: [{kind: 'omnibox', text: 'kayak rocky rivers'}],
    stepsNote:
      'The sheet’s example, “running shoes rocky terrain”, is not in this catalog: the steps search “kayak rocky rivers”.',
  },
  {
    id: 'UC-05',
    group: 'other',
    title: 'UC-05 · Search results as a layout inside the canvas',
    expected:
      'Product grid, facets, sort, pagination and badges render in the same canvas as the conversational layouts, at parity with the existing search page.',
    checks: [
      'The product grid, facets, sort, pagination and badges render.',
      'They render in the same canvas as the conversational layouts.',
    ],
    status: {
      state: 'partly',
      note: 'A search draws the grid, facets, sort, page size and pagination on the search layout, with the chat panel beside it, not inside the conversation: a turn of the conversation that draws a search opens that layout. No product badges come back, and the rating facet shows its ranges as prices ($3 - $3.4).',
    },
    steps: [{kind: 'omnibox', text: 'life jackets'}],
    stepsNote:
      'The sheet’s example, “waterproof trail runners”, is not in this catalog: the steps search “life jackets”.',
  },
  {
    id: 'UC-13',
    group: 'other',
    title: 'UC-13 · Single-intent product search',
    expected:
      'A curated product carousel or grid with a short summary of how the request was read.',
    checks: ['Yellow paddleboards under $1,000, with a short summary of the request.'],
    status: {
      state: 'ready',
      note: 'A carousel titled for the request (6 yellow paddleboards, $468 to $780) with a one-line summary, in 2 of 2 runs.',
    },
    steps: [{kind: 'omnibox', text: 'I want to see yellow paddleboard options under $1,000'}],
  },
  {
    id: 'UC-14',
    group: 'other',
    title: 'UC-14 · Multi-intent search with grouped carousels',
    expected: 'One carousel per need in a single answer.',
    checks: ['One answer with a carousel each for wetsuits, bags and surfboards.'],
    status: {
      state: 'ready',
      note: 'One answer with three carousels, wetsuits, bags and surfboards, and a summary of their price ranges, in 2 of 2 runs.',
    },
    steps: [{kind: 'omnibox', text: 'show me wetsuits, a bag and surfboards'}],
  },
  {
    id: 'UC-15',
    group: 'other',
    title: 'UC-15 · Product education',
    expected:
      'An answer from catalog attributes, with the products inline (product research card).',
    checks: ['The agent says whether the first bag is waterproof, with the product inline.'],
    status: {
      state: 'not-ready',
      note: 'The service routes the question to a search, not to the agent: “is the first one waterproof?” after the dry bag answer opens results for that text (42 products) with no answer, in 2 of 2 runs. So do “is the Purple DryBag waterproof?” in the header box and “Is this bag waterproof?” in the panel next to dry bags (2 of 2 each). The agent can draw a product research card (seen in UC-02 and UC-21).',
    },
    steps: [
      {kind: 'omnibox', text: 'which dry bag should I get?'},
      {kind: 'panel', text: 'is the first one waterproof?'},
    ],
    stepsNote:
      'The sheet’s example is “is this bag waterproof?”: the steps ask for dry bags first, so the question has a bag to refer to.',
  },
  {
    id: 'UC-16',
    group: 'other',
    title: 'UC-16 · Product comparison',
    expected: 'A side-by-side comparison table with key differences and a recommendation summary.',
    checks: ['A comparison table of the top three kayaks, with a recommendation.'],
    status: {
      state: 'ready',
      note: 'After the kayak answer, “compare the top 3” gets a comparison table of three kayaks with a recommendation, in 2 of 2 runs.',
    },
    steps: [
      {kind: 'omnibox', text: 'which kayak should I get?'},
      {kind: 'panel', text: 'compare the top 3'},
    ],
    stepsNote: 'The steps ask for kayaks first, so “the top 3” has something to refer to.',
  },
  {
    id: 'UC-17',
    group: 'other',
    title: 'UC-17 · Product bundle',
    expected: 'A curated set across categories with a running total.',
    checks: ['A set of surfing products across categories, with a total within $400.'],
    status: {
      state: 'ready',
      note: 'A surfing starter bundle across categories (a board with a wetsuit, or with a board bag and wax) and its package total within the budget ($336, $347), in 2 of 2 runs.',
    },
    steps: [{kind: 'omnibox', text: 'what do I need to get started surfing, I have a $400 budget'}],
  },
  {
    id: 'UC-18',
    group: 'other',
    title: 'UC-18 · Refine a conversational answer',
    expected: 'Narrows any previous layout without starting over.',
    checks: ['The kayaks of the first answer, narrowed to under $1,000.'],
    status: {
      state: 'partly',
      note: 'In run 1, “under $1,000” narrowed the kayaks to a new carousel of the 2 under $1,000. In run 2 the agent only answered in text, naming one kayak, with no new layout.',
    },
    steps: [
      {kind: 'omnibox', text: 'which kayak should I get?'},
      {kind: 'panel', text: 'under $1,000'},
    ],
    stepsNote: 'The steps ask for kayaks first, so “under $1,000” has an answer to narrow.',
  },
  {
    id: 'UC-19',
    group: 'other',
    title: 'UC-19 · Suggested next steps',
    expected: 'Each answer proposes follow-ups as one-click chips that resubmit as prompts.',
    checks: [
      'The answer ends with follow-up chips.',
      'The first one is sent as the next prompt, and its answer joins the conversation.',
    ],
    status: {
      state: 'ready',
      note: 'Answers end with follow-up chips, and one click sends one: in 2 of 2 runs the first was a search chip (“Show wetsuits”), which opened its results with the conversation in the panel. An answer that asks a clarifying question comes with none (UC-22).',
    },
    steps: [{kind: 'omnibox', text: 'what do I need to go snorkeling?'}, {kind: 'chip'}],
    stepsNote: 'The sheet gives no example: the steps ask a question of this catalog.',
  },
  {
    id: 'UC-20',
    group: 'other',
    title: 'UC-20 · Progress while the agent works',
    expected:
      'An expandable block shows the reasoning and steps before the answer lands. First render within 10 s (15 s for comparison and bundle).',
    checks: [
      'The reasoning and the agent’s steps show while it works, and can be expanded.',
      'The answer starts to show within 10 s.',
    ],
    status: {
      state: 'partly',
      note: 'An expandable block shows the reasoning and each tool call while the agent works, and the products land about 10 s after the question. But the page shows only “Working on…” until the answer’s first surface arrives (5.5 s median), and for 6 of 39 header questions the agent answered, it came after 10 s: the service waited 11 to 14 s before sending anything.',
    },
    steps: [{kind: 'omnibox', text: 'what life jacket should I get for my kid?'}],
    stepsNote: 'The sheet gives no example: the steps ask a question of this catalog.',
  },
  {
    id: 'UC-21',
    group: 'other',
    title: 'UC-21 · Multi-turn context and topic change',
    expected: 'Follow-ups stay in context; a new question is recognized as a new topic.',
    checks: [
      'The follow-up is answered about the kayaks.',
      'The wetsuit question is answered as a new topic, not about kayaks.',
    ],
    status: {
      state: 'ready',
      note: 'The sit-on-top follow-up is answered about the kayaks of the first answer, and the wetsuit question gets cold-water wetsuits, in 2 of 2 runs.',
    },
    steps: [
      {kind: 'omnibox', text: 'which kayak should I get?'},
      {kind: 'panel', text: 'is a sit-on-top worth it?'},
      {kind: 'panel', text: 'what wetsuit do I need for cold water?'},
    ],
    stepsNote:
      'The sheet’s example, “is brushless worth it?”, is for a robotics catalog: the steps ask about kayaks, then wetsuits.',
  },
  {
    id: 'UC-22',
    group: 'other',
    title: 'UC-22 · Clarifying questions instead of dead ends',
    expected:
      'When the request is vague, the agent asks a question or offers next steps rather than refusing.',
    checks: ['The agent asks a question or offers next steps.'],
    status: {
      state: 'ready',
      note: 'The agent asks what the trip needs (apparel, gear or a sport?) instead of refusing, in 2 of 2 runs. It offers no follow-up chips.',
    },
    steps: [{kind: 'omnibox', text: 'can you help me find something for my trip?'}],
    stepsNote: 'The sheet gives no example: the steps make a vague request.',
  },
  {
    id: 'UC-23',
    group: 'other',
    title: 'UC-23 · Conversation history',
    expected:
      'New conversation, a history list to reopen or delete past conversations, kept across page reloads.',
    checks: [],
    status: {
      state: 'not-ready',
      note: 'The sample has no conversation history: no new-conversation button, no history list, and a page load starts a new session.',
    },
    steps: [],
  },
  {
    id: 'UC-25',
    group: 'other',
    title: 'UC-25 · Popular questions in AI mode',
    expected: 'In AI mode the dropdown suggests questions the shopper can send in one click.',
    checks: [],
    status: {
      state: 'not-ready',
      note: 'The header box has no AI mode and no dropdown: it sends nothing while typing (as for UC-24).',
    },
    steps: [],
    related: ['UC-24'],
  },
  {
    id: 'UC-26',
    group: 'other',
    title: 'UC-26 · Shoppable product cards',
    expected:
      'Every product named in an answer appears as a card with the right price and a link to its product page. Clicks are tracked.',
    checks: [
      'Each kayak the answer names has a card, with the price the answer gives and a link.',
      'A click on a card is tracked.',
    ],
    status: {
      state: 'partly',
      note: 'A carousel’s cards show the name, brand and price the answer gives, link to the product’s page on the store and add to the cart (the header counts it), in 2 of 2 runs. Products in a comparison table or a bundle have no link or Add to cart, and the sample tracks no clicks.',
    },
    steps: [{kind: 'omnibox', text: 'I want to see kayak options under $1,500'}, {kind: 'cart'}],
    stepsNote:
      'The sheet gives no example: the steps ask for kayaks, then add the first card to the cart.',
  },
  {
    id: 'UC-27',
    group: 'other',
    title: 'UC-27 · Buyer-specific prices and catalog',
    expected:
      'Prices switch to contract rates and the catalog narrows to compatible parts for the logged-in buyer.',
    checks: [],
    status: {
      state: 'not-ready',
      note: 'The sample has no login: no buyer, contract prices or narrowed catalog.',
    },
    steps: [],
  },
  {
    id: 'UC-28',
    group: 'other',
    title: 'UC-28 · Listing page with AI-generated facets per category',
    expected:
      'Each category shows the facets buyers actually use (torque, voltage, IP rating) without manual setup.',
    checks: ['Each listing shows facets of its own category.'],
    status: {
      state: 'partly',
      note: 'A listing page sends its category name as a search. Paddling opens the results with facets, which follow the results from the organization’s facets (paddles get material, life jackets gender): nothing shows they are generated per category. The Wetsuits & Drysuits page went to the agent in 2 of 2 runs: a carousel and chips, no facets.',
    },
    steps: [
      {kind: 'listing', name: 'Paddling'},
      {kind: 'listing', name: 'Wetsuits & Drysuits'},
    ],
    stepsNote:
      'The sheet’s example, “Drive Systems, then Sensors & Vision”, is for a robotics catalog: the steps open two listings of this one.',
    related: ['UC-08'],
  },
  {
    id: 'UC-29',
    group: 'other',
    title: 'UC-29 · Product page recommendations',
    expected:
      'Compatible products, accessories and frequently bought together carousels on the product page.',
    checks: [],
    status: {
      state: 'not-ready',
      note: 'The sample has no product page: a card’s name links to the product’s page on the store (sports.barca.group), outside the sample.',
    },
    steps: [],
    related: ['UC-30'],
  },
  {
    id: 'UC-32',
    group: 'other',
    title: 'UC-32 · Support question in the same box',
    expected:
      'Routes to support results with a generated answer citing sources, and follow-ups stay in context.',
    checks: [
      'The answer is a support answer that cites its sources.',
      'The follow-up stays on the same problem.',
    ],
    status: {
      state: 'not-ready',
      note: 'The agent refuses (“That’s outside what I can help with”), and refuses the follow-up too, in 2 of 2 runs: no support results and no cited sources.',
    },
    steps: [
      {kind: 'omnibox', text: 'my kayak rudder is stuck, how do I fix it'},
      {kind: 'panel', text: 'what tools do I need for that?'},
    ],
    stepsNote:
      'The sheet’s example, “troubleshoot servo motor overheating”, is for a robotics catalog: the steps ask about a kayak.',
  },
  {
    id: 'UC-33',
    group: 'other',
    title: 'UC-33 · Works on mobile and tablet',
    expected:
      'The experience is usable on mobile and tablet; today the conversation takes over the whole mobile screen.',
    checks: [],
    status: {
      state: 'not-ready',
      note: 'The player cannot change the screen size, so it was measured on its own. On a 390 px phone the header’s search box shrinks to nothing (0 px wide): the shopper cannot search or ask from the header. On an 820 px tablet everything works, with the chat panel stacked above the results instead of beside them.',
    },
    steps: [],
  },
  {
    id: 'edge-header-question',
    group: 'edge',
    title: 'Edge · A question in the header box after a search',
    expected:
      'The question opens the conversation instead of a search. The conversation has no results beside it, so the next question in it is not about the kayaks.',
    checks: ['The next question in the conversation gets no kayaks answer.'],
    status: {
      state: 'not-ready',
      note: 'The question opens the assistant layout (the agent says a wetsuit question is outside what it can help with), but the service tells the agent about the latest search wherever the question is asked, so the next answer is about the kayaks, in 2 of 2 runs. Which results a question is about is a rule still to land (there is no ask action yet).',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'omnibox', text: 'what is a wetsuit?'},
      CHEAPEST,
    ],
    related: ['UC-21'],
  },
  {
    id: 'edge-search-chip',
    group: 'edge',
    title: 'Edge · A search chip from the panel',
    expected:
      'Picking the search the agent proposes opens new results, and the next panel question is about them.',
    checks: ["The cheapest is from the chip's search."],
    status: {
      state: 'not-ready',
      note: 'The agent proposes follow-ups in its own words, with no "See all kayaks" search chip: the step depends on its wording, which varies between runs.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Which kayak is best for a beginner? Show me the options.'},
      {kind: 'chip', text: 'See all kayaks'},
      CHEAPEST,
    ],
  },
  {
    id: 'edge-home-after-search',
    group: 'edge',
    title: 'Edge · Search, then the home page, then the panel',
    expected:
      'The shopper leaves the results for the home page, where the panel has no results next to it. Whether its question is about the last results is still open.',
    checks: ['What the panel question is about once the results are gone.'],
    status: {
      state: 'partly',
      note: 'The service answers about the kayaks (the last results); the rule is not decided yet.',
    },
    steps: [{kind: 'omnibox', text: 'kayaks'}, {kind: 'home'}, CHEAPEST],
  },
  {
    id: 'edge-home-after-question',
    group: 'edge',
    title: 'Edge · Search, a header question, the home page, then the panel',
    expected:
      'The page moved on to a conversation, then to the home page: the panel question is not about the kayaks.',
    checks: ['The panel question gets no kayaks answer.'],
    status: {
      state: 'not-ready',
      note: 'The service tells the agent about the latest search wherever the panel is, so the home page panel answers about the kayaks.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'omnibox', text: 'what is a wetsuit?'},
      {kind: 'home'},
      CHEAPEST,
    ],
  },
];

export const STATUS_LABELS: Record<UseCaseStatus['state'], string> = {
  ready: 'Ready',
  partly: 'Partly working',
  'not-ready': 'Not ready',
};

export function describeStep(step: Step): string {
  switch (step.kind) {
    case 'omnibox':
      return `Header box: “${step.text}”`;
    case 'type':
      return `Header box, typing: “${step.text}”`;
    case 'panel':
      return `Assistant: “${step.text}”`;
    case 'facet':
      return `Results: facet “${step.value}”`;
    case 'listing':
      return `Listing: ${step.name}`;
    case 'chip':
      return step.text === undefined
        ? 'Follow-up: the first one suggested'
        : `Follow-up: “${step.text}”`;
    case 'cart':
      return 'Product card: Add to cart';
    case 'home':
      return 'Header: Storefront home';
  }
}
