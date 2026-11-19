import type {AgentMessage} from '@coveo/thermidor';
import {marked} from 'marked';
import DOMPurify from 'dompurify';

export type {AgentMessage} from '@coveo/thermidor';

/** Concatenate message contents in arrival order, separating distinct messages with newlines */
export function assembleMessages(messages: AgentMessage[]): string {
  return messages.map((m) => m.content).join('\n\n');
}

export interface PriceFormat {
  /** BCP 47 locale, e.g. `en-US` or `fr-CA`. */
  locale: string;
  /** ISO 4217 currency code, e.g. `USD`. */
  currency: string;
}

const numberFormats = new Map<string, Intl.NumberFormat>();

/** Format a price in the given locale and currency. */
export function formatPrice(price: number, {locale, currency}: PriceFormat): string {
  const key = `${locale}|${currency}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, {style: 'currency', currency, useGrouping: false});
    numberFormats.set(key, format);
  }
  return format.format(price);
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
