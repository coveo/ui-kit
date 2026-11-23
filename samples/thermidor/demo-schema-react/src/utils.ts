import type {AgentMessage} from '@coveo/thermidor';
import {marked} from 'marked';
import DOMPurify from 'dompurify';

export type {AgentMessage} from '@coveo/thermidor';

/** Concatenate message contents in arrival order, separating distinct messages with newlines */
export function assembleMessages(messages: AgentMessage[]): string {
  return messages.map((m) => m.content).join('\n\n');
}

/** Fields whose numeric values are prices. */
export const PRICE_FIELDS = new Set(['ec_price', 'ec_promo_price']);

export interface PriceFormat {
  /** BCP 47 locale, e.g. `en-US` or `fr-CA`. */
  locale: string;
  /** ISO 4217 currency code, e.g. `USD`. */
  currency: string;
  /** Drop the decimals of whole amounts (`$100`), as range labels do. */
  compact?: boolean;
}

const numberFormats = new Map<string, Intl.NumberFormat>();

/** Format a price in the given locale and currency. */
export function formatPrice(
  price: number,
  {locale, currency, compact = false}: PriceFormat
): string {
  const key = `${locale}|${currency}|${compact}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      // Keeps `$1234.50` as before, instead of `$1,234.50`; in fr-FR it gives `1234,50 €`.
      useGrouping: false,
      ...(compact && {minimumFractionDigits: 0}),
    });
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
