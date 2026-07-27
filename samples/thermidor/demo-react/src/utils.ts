import type {AgentMessage} from '@coveo/thermidor';

export type {AgentMessage} from '@coveo/thermidor';

/** Concatenate message contents in arrival order, separating distinct messages with newlines */
export function assembleMessages(messages: AgentMessage[]): string {
  return messages.map((m) => m.content).join('\n\n');
}

/** Format price as currency string with 2 decimals */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
