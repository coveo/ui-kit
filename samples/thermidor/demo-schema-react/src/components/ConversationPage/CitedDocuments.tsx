import {useId} from 'react';
import type {CitedDocument} from '../../citations/citations.js';
import {DocumentRows} from '../DocumentRows/DocumentRows.js';
import styles from './CitedDocuments.module.css';

/** The documents an answer cites, each with the label the answer's text cites it by. */
export function CitedDocuments({documents}: {documents: CitedDocument[]}) {
  const headingId = useId();
  if (documents.length === 0) {
    return null;
  }
  const rows = documents.map((document) => ({
    lead: `[${document.label}]`,
    title: document.title ?? document.link ?? `Document ${document.label}`,
    href: document.link ?? undefined,
    meta: document.details?.source?.name,
  }));
  return (
    <section className={styles.container} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.heading}>
        Sources
      </h3>
      <DocumentRows rows={rows} />
    </section>
  );
}
