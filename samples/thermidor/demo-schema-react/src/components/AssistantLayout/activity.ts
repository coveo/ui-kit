import type {AddedMessage, ReasoningStep, ToolCallStep} from '@coveo/thermidor';

/** One line of the assistant's activity: a tool call, or a message the shopper added. */
export type ActivityEntry =
  | {kind: 'step'; id: string; text: string; done: boolean}
  | {kind: 'added'; id: string; text: string; status: AddedMessage['status']};

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

/** A tool call by its name, with the words it searched for, such as `coveo_commerce_search “kayak”`. */
export function describeToolCall(step: ToolCallStep): string | undefined {
  if (isHidden(step.name)) {
    return undefined;
  }
  const words = subject(step.args);
  return words ? `${step.name} “${words}”` : step.name;
}

/**
 * The answer's activity, oldest first: its tool calls, and the messages
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
