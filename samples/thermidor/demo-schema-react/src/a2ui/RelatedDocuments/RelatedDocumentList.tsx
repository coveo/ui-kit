import type {ProductResearchCardState} from '@coveo/thermidor-schema';
import {FileIcon} from '../icons/index.js';
import styles from './RelatedDocumentList.module.css';

// The package root does not export `ProductResearchRelatedDocument`, so derive it from the state
// that carries it. `ComparisonProduct.relatedDocuments` reuses the same definition.
type RelatedDocument = NonNullable<ProductResearchCardState['relatedDocuments']>[number];

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
  documents: readonly RelatedDocument[] | undefined,
  linkLimit: number
): RelatedDocument[] {
  return (documents ?? [])
    .filter((document) => document.title || document.clickUri)
    .slice(0, linkLimit);
}

// Renderers navigate only to http(s); any other scheme renders the title as plain text.
function safeHref(clickUri: string | undefined): string | undefined {
  return clickUri && /^https?:\/\//i.test(clickUri) ? clickUri : undefined;
}

/**
 * Lists related documents one row each: a file icon, the title linking to the document, and the
 * file type and size. Pass the documents through `visibleDocuments` first.
 */
export function RelatedDocumentList({documents}: {documents: RelatedDocument[]}) {
  return (
    <ul className={styles.documentRows}>
      {documents.map((document, index) => {
        const label = document.title || document.clickUri;
        const href = safeHref(document.clickUri);
        const meta = [
          document.filetype?.toUpperCase(),
          document.size === undefined ? '' : formatDocumentSize(document.size),
        ]
          .filter(Boolean)
          .join(' - ');
        // Documents carry no client-facing id, and the list is static per render.
        return (
          <li key={index} className={styles.documentRow}>
            <FileIcon className={styles.documentIcon} />
            <div className={styles.documentText}>
              {href ? (
                <a
                  className={styles.documentLink}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              ) : (
                <span className={styles.documentTitle}>{label}</span>
              )}
              {meta && <span className={styles.documentMeta}>{meta}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
