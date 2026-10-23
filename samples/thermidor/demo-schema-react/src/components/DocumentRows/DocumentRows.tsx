import {FileIcon} from '../../a2ui/icons/index.js';
import styles from './DocumentRows.module.css';

/** What one row shows about a document. */
export interface DocumentRow {
  title: string;
  /** Where the title links to; the title is plain text without one. Only http(s) is followed. */
  href?: string;
  /** A short line under the title, such as the file type and size. */
  meta?: string;
  /** Shown before the icon, such as the label a citation refers to the document by. */
  lead?: string;
}

// Renderers navigate only to http(s); any other scheme renders the title as plain text.
function safeHref(href: string | undefined): string | undefined {
  return href && /^https?:\/\//i.test(href) ? href : undefined;
}

/**
 * Lists documents one row each: an optional lead, a file icon, the title linking to the document,
 * and a meta line. `compact` drops the row card and shrinks the row to fit a table cell.
 */
export function DocumentRows({rows, compact = false}: {rows: DocumentRow[]; compact?: boolean}) {
  return (
    <ul className={compact ? `${styles.documentRows} ${styles.compact}` : styles.documentRows}>
      {rows.map((row, index) => {
        const href = safeHref(row.href);
        // Rows carry no client-facing id, and the list is static per render.
        return (
          <li key={index} className={styles.documentRow}>
            {row.lead && <span className={styles.documentLead}>{row.lead}</span>}
            <FileIcon className={styles.documentIcon} />
            <div className={styles.documentText}>
              {href ? (
                <a
                  className={styles.documentLink}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {row.title}
                </a>
              ) : (
                <span className={styles.documentTitle}>{row.title}</span>
              )}
              {row.meta && <span className={styles.documentMeta}>{row.meta}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
