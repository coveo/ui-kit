import type {AddedMessage, ReasoningStep, ToolCallStep} from '@coveo/thermidor';

/** One line of the assistant's activity, in the shopper's words. */
export type ActivityEntry =
  | {kind: 'step'; id: string; text: string; done: boolean}
  | {kind: 'added'; id: string; text: string; status: AddedMessage['status']};

/** What each tool does, while it runs and once it is done. */
const TOOL_PHRASES: Record<string, readonly [doing: string, done: string]> = {
  coveo_commerce_search: ['Searching', 'Searched'],
  coveo_commerce_catalog_facets: [
    'Looking through the catalog for',
    'Looked through the catalog for',
  ],
  discover_price_range: ['Checking prices for', 'Checked prices for'],
  list_product_attributes: [
    'Looking at what sets products apart',
    'Looked at what sets products apart',
  ],
  lookup_cached_products: ['Comparing the products found', 'Compared the products found'],
  get_product_variants: ['Checking sizes and colors', 'Checked sizes and colors'],
  coveo_commerce_product_reviews: ['Reading reviews', 'Read reviews'],
  get_product_reviews: ['Reading reviews', 'Read reviews'],
  coveo_commerce_related_documents: ['Reading guides', 'Read guides'],
  coveo_commerce_related_passages: ['Reading guides', 'Read guides'],
  coveo_knowledge_search: ['Looking it up', 'Looked it up'],
  coveo_passage_retrieval: ['Looking it up', 'Looked it up'],
  store_render_plan: ['Putting the answer together', 'Put the answer together'],
  store_response_plan: ['Planning the answer', 'Planned the answer'],
  render_bundle: ['Building the bundle', 'Built the bundle'],
  render_comparison_table: ['Building the comparison', 'Built the comparison'],
  render_comparison_summary: ['Summing up the comparison', 'Summed up the comparison'],
  render_product_carousel: ['Picking products to show', 'Picked products to show'],
  render_product_research_card: ['Writing up the product', 'Wrote up the product'],
  render_next_actions: ['Suggesting what to do next', 'Suggested what to do next'],
};

/** Bookkeeping the shopper never needs to see: routing and memory. */
function isHidden(name: string): boolean {
  return name.startsWith('route') || name === 'store_reference_context';
}

function isToolCall(step: ReasoningStep): step is ToolCallStep {
  return step.type === 'tool-call';
}

/** The words the tool was called with, when it searched for some. */
function subject(args: string): string | undefined {
  try {
    const parsed = JSON.parse(args) as Record<string, unknown>;
    const value = parsed['query'] ?? parsed['keywords'] ?? parsed['product_name'];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  } catch {
    return undefined;
  }
}

/** A tool call in the shopper's words, such as "Checked prices for “kayak paddle”". */
export function describeToolCall(step: ToolCallStep): string | undefined {
  if (isHidden(step.name)) {
    return undefined;
  }
  const done = step.status === 'completed';
  const words = subject(step.args);
  const phrases = TOOL_PHRASES[step.name];
  if (phrases) {
    const verb = phrases[done ? 1 : 0];
    return words ? `${verb} “${words}”` : verb;
  }
  const action = step.name
    .replace(/^coveo_commerce_|^coveo_/, '')
    .replace(/^render_/, 'preparing ')
    .replace(/_/g, ' ');
  return words
    ? `${done ? 'Done' : 'Working'}: ${action} “${words}”`
    : `${done ? 'Done' : 'Working'}: ${action}`;
}

/**
 * The answer's activity, oldest first: its tool calls in the shopper's words, and the messages
 * the shopper added, each right after the step the agent had reached when it took it.
 * `takenAfter` maps an added message to that number of steps; messages not taken yet come last.
 */
export function activityOf(
  reasoningSteps: readonly ReasoningStep[],
  addedMessages: readonly AddedMessage[],
  takenAfter: ReadonlyMap<string, number>
): ActivityEntry[] {
  const steps: ActivityEntry[] = [];
  for (const step of reasoningSteps) {
    if (!isToolCall(step)) continue;
    const text = describeToolCall(step);
    if (text) {
      steps.push({kind: 'step', id: step.id, text, done: step.status === 'completed'});
    }
  }
  const entries: ActivityEntry[] = [];
  const placed = new Set<string>();
  steps.forEach((step, index) => {
    entries.push(step);
    for (const message of addedMessages) {
      if (takenAfter.get(message.id) === index + 1 && !placed.has(message.id)) {
        placed.add(message.id);
        entries.push({kind: 'added', id: message.id, text: message.text, status: message.status});
      }
    }
  });
  for (const message of addedMessages) {
    if (!placed.has(message.id)) {
      const atStart = takenAfter.get(message.id) === 0;
      const entry: ActivityEntry = {
        kind: 'added',
        id: message.id,
        text: message.text,
        status: message.status,
      };
      if (atStart) entries.unshift(entry);
      else entries.push(entry);
    }
  }
  return entries;
}

/** How many of the answer's steps the shopper would see, for "Stopped after N steps". */
export function visibleStepCount(reasoningSteps: readonly ReasoningStep[]): number {
  return reasoningSteps.filter((step) => isToolCall(step) && describeToolCall(step)).length;
}
