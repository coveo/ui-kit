import type {AgentMessage} from '@coveo/thermidor';
import {marked} from 'marked';
import DOMPurify from 'dompurify';

export type {AgentMessage} from '@coveo/thermidor';

/** Concatenate message contents in arrival order, separating distinct messages with newlines */
export function assembleMessages(messages: AgentMessage[]): string {
  return messages.map((m) => m.content).join('\n\n');
}

/** Format price as currency string with 2 decimals */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/** Render a markdown string to sanitized HTML */
export function renderMarkdown(text: string): string {
  try {
    const raw = marked.parse(text, {breaks: true, gfm: true}) as string;
    return DOMPurify.sanitize(raw);
  } catch {
    return DOMPurify.sanitize(text);
  }
}
