/**
 * The scenarios the use-case player replays, through the page's own controls, as a shopper would.
 * Each PM scenario is one of the product's multi-surface use cases (the "Multi-surface" tab of the
 * use-case sheet), titled and described in its words; its status says how far the sample, on the
 * mock backend, gets today. The edge checks guard the rules between surfaces that no use case
 * names on its own.
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
  /** Picks a follow-up action of the agent's last answer. */
  | {kind: 'chip'; text: string}
  /** Goes back to the storefront's home page. */
  | {kind: 'home'};

export type UseCaseStatus =
  | {state: 'ready'; note?: string}
  | {state: 'partly'; note: string}
  | {state: 'mocked'; note: string}
  | {state: 'not-ready'; note: string};

export interface RelatedUseCase {
  id: string;
  title: string;
}

export interface UseCase {
  id: string;
  group: 'pm' | 'edge';
  title: string;
  /** What the shopper sees, as the use case states it. */
  expected: string;
  /** What the steps check on top of it. */
  checks: string[];
  status: UseCaseStatus;
  steps: Step[];
  /** Use cases of the sheet's "Other use cases" tab this scenario touches. */
  related?: RelatedUseCase[];
}

export const USE_CASE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/18MNf__WtVYOiyQerR5zsvK6l-DH3XYf8jK9yrOp6SvM';

const CHEAPEST: Step = {kind: 'panel', text: 'Which is the cheapest?'};

const NEEDS_AGENT_DIRECTIVE =
  'Nothing in the mock backend lets the agent change the results next to the panel: it needs the agent directive, which only the real gateway has.';

export const USE_CASES: readonly UseCase[] = [
  {
    id: 'UC-04',
    group: 'pm',
    title: 'UC-04 · Search with no results hands over to the conversation',
    expected:
      'Instead of a zero-result page, the conversation picks up the query. For broad queries with very few results, the panel can offer help ("Want help narrowing this down?").',
    checks: ['A panel question after the empty search is not about the empty results.'],
    status: {
      state: 'not-ready',
      note: 'The mock backend never returns zero results (a query it cannot match opens the whole catalog), and the search box has no hand-over to the conversation.',
    },
    steps: [{kind: 'omnibox', text: 'snow shovel'}, CHEAPEST],
  },
  {
    id: 'UC-06',
    group: 'pm',
    title: 'UC-06 · Results stacked in the conversation or side by side',
    expected: 'The search layout can be shown inline in the conversation thread, or next to it.',
    checks: [
      'Products the agent shows in the thread sit next to the kayaks results.',
      '"Which of these" after them means the products in the thread, not the kayaks.',
    ],
    status: {
      state: 'partly',
      note: 'Products show inline in the thread next to the results, but a question about "these" is answered from the kayaks next to the panel.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Show me 3 life jackets with their prices'},
      {kind: 'panel', text: 'Which of these is the cheapest?'},
    ],
  },
  {
    id: 'UC-07',
    group: 'pm',
    title: 'UC-07 · Collapsible chat panel on the results page',
    expected:
      'An AI button opens a conversational panel that slides in over the results. Closing it keeps the conversation, and reopening it continues where the shopper left off.',
    checks: [
      'The panel opens next to the results and its question is about them.',
      'A second question continues the same conversation.',
    ],
    status: {
      state: 'partly',
      note: 'The panel is always open next to the results and keeps the conversation; there is no AI button, and it cannot be closed or reopened.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      CHEAPEST,
      {kind: 'panel', text: 'Are these kayaks good for rivers?'},
    ],
  },
  {
    id: 'UC-08',
    group: 'pm',
    title: 'UC-08 · Conversation knows what the shopper did on the listing',
    expected:
      'The assistant sees the current query, facets and results. If the panel was closed while the shopper kept searching, it resumes aware of what changed.',
    checks: [
      "After a facet, the cheapest is the refined one (LakeGlide), not the kayaks of the agent's answers.",
      'After a listing page, the cheapest is from that listing.',
      'After another header search, the cheapest is from the surfboards.',
    ],
    status: {
      state: 'ready',
      note: 'The mock agent answers "which is the cheapest?" from the results next to the panel; other questions get its canned answers.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Are these kayaks good for rivers?'},
      {kind: 'facet', value: 'Wilderness Systems'},
      CHEAPEST,
      {kind: 'listing', name: 'Surfing'},
      CHEAPEST,
      {kind: 'omnibox', text: 'surfboards'},
      CHEAPEST,
    ],
    related: [{id: 'UC-28', title: 'Listing page with AI-generated facets per category'}],
  },
  {
    id: 'UC-09',
    group: 'pm',
    title: 'UC-09 · From the grid into the conversation',
    expected:
      'A question asked from the results moves into a conversational layout about those results.',
    checks: ['The question asked next to the results is answered about those results.'],
    status: {
      state: 'partly',
      note: 'The question goes to the panel next to the results, with no switch to a conversational layout; the mock agent only answers "which is the cheapest?" from the results.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Which of these is best for rocky terrain?'},
      CHEAPEST,
    ],
  },
  {
    id: 'UC-10',
    group: 'pm',
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
    group: 'pm',
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
    group: 'pm',
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
    group: 'pm',
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
    group: 'pm',
    title: 'UC-30 · Home page recommendations',
    expected: 'A product carousel on the home page (surface storefront-preview-home).',
    checks: [
      'The home page shows a carousel of its own.',
      'A question about "these" from the home page is about that carousel.',
    ],
    status: {
      state: 'not-ready',
      note: 'The home page sends no request (the mock backend has nothing to answer storefront-preview-home with), so it has no carousel; the panel there answers a recommendation with a carousel in its thread, but not a question about it.',
    },
    steps: [
      {kind: 'home'},
      {kind: 'panel', text: 'Recommend some popular gifts under $50'},
      {kind: 'panel', text: 'Which of these is the cheapest?'},
    ],
    related: [{id: 'UC-29', title: 'Product page recommendations'}],
  },
  {
    id: 'UC-34',
    group: 'pm',
    title: 'UC-34 · Conversation edits the cart, using the listing',
    expected:
      'From the chat panel next to the listing, the shopper asks the assistant to add, remove or swap cart items, referring to products on the listing. The cart in the header updates and the agent confirms what changed.',
    checks: ['The header cart gets the first two kayaks of the results.'],
    status: {state: 'not-ready', note: NEEDS_AGENT_DIRECTIVE},
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'panel', text: 'Add the top two results to my cart'},
    ],
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
      note: 'The mock backend tells the agent about the latest search wherever the question is asked, so it answers with the cheapest kayak. Which results a question is about is a rule still to land.',
    },
    steps: [
      {kind: 'omnibox', text: 'kayaks'},
      {kind: 'omnibox', text: 'what is a wetsuit?'},
      CHEAPEST,
    ],
    related: [{id: 'UC-21', title: 'Multi-turn context and topic change'}],
  },
  {
    id: 'edge-search-chip',
    group: 'edge',
    title: 'Edge · A search chip from the panel',
    expected:
      'Picking the search the agent proposes opens new results, and the next panel question is about them.',
    checks: ["The cheapest is from the chip's search."],
    status: {state: 'ready'},
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
      note: 'The mock backend answers about the kayaks (the last results); the rule is not decided yet.',
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
      note: 'The mock backend tells the agent about the latest search wherever the panel is, so it answers with the cheapest kayak.',
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
  mocked: 'Mocked',
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
      return `Follow-up: “${step.text}”`;
    case 'home':
      return 'Header: Storefront home';
  }
}
