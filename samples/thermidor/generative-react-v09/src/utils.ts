export interface AgentMessage {
  content: string;
  role: string;
}

/** Concatenate message contents in arrival order, separating distinct messages with newlines */
export function assembleMessages(messages: AgentMessage[]): string {
  return messages.map((m) => m.content).join('\n\n');
}

/** Truncate text at maxLength, append ellipsis if exceeded */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '\u2026';
}

/** Format price as currency string with 2 decimals */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
