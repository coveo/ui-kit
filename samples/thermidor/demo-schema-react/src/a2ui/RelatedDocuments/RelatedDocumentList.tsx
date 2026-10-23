import type {ProductResearchRelatedDocument} from '@coveo/thermidor-schema';
import {DocumentRows} from '../../components/DocumentRows/DocumentRows.js';

export const DEFAULT_MAX_LINKS = 10;

const SIZE_UNITS = ['B', 'kB', 'MB', 'GB'] as const;

/**
 * Formats a size in bytes with a decimal unit and one decimal, e.g. `333.2 kB`; `''` when invalid.
 */
export function formatDocumentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '';
  }
  let size = bytes;
  let unit = 0;
  while (unit < SIZE_UNITS.length - 1 && Number(size.toFixed(1)) >= 1000) {
    size /= 1000;
    unit += 1;
  }
  const rounded = unit === 0 ? size : Number(size.toFixed(1));
  return `${rounded} ${SIZE_UNITS[unit]}`;
}

/**
 * Turns a `maxLinks` option into a list length: fractions round down, and `0`, a negative number or
 * `NaN` give `0`. `Infinity` stays as is.
 */
export function toLinkLimit(maxLinks: number): number {
  return Number.isNaN(maxLinks) ? 0 : Math.max(0, Math.floor(maxLinks));
}

/**
 * The documents a list shows, in the order the agent sent them: a document with neither a title nor
 * a link has nothing to show, so it takes no slot.
 */
export function visibleDocuments(
  documents: readonly ProductResearchRelatedDocument[] | undefined,
  linkLimit: number
): ProductResearchRelatedDocument[] {
  return (documents ?? [])
    .filter((document) => document.title || document.clickUri)
    .slice(0, linkLimit);
}

/**
 * Lists related documents one row each: a file icon, the title linking to the document, and the
 * file type and size. Pass the documents through `visibleDocuments` first. `compact` drops the row
 * card and shrinks the row to fit a table cell.
 */
export function RelatedDocumentList({
  documents,
  compact = false,
}: {
  documents: ProductResearchRelatedDocument[];
  compact?: boolean;
}) {
  const rows = documents.map((document) => ({
    title: document.title || document.clickUri || '',
    href: document.clickUri,
    meta: [
      document.filetype?.toUpperCase(),
      document.size === undefined ? '' : formatDocumentSize(document.size),
    ]
      .filter(Boolean)
      .join(' - '),
  }));
  return <DocumentRows rows={rows} compact={compact} />;
}
