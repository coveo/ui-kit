import {useId} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {DocumentRows} from '../../components/DocumentRows/DocumentRows.js';
import {CitedDocumentsPropsSchema, type CitedDocument} from './cited-documents-schema.js';
import styles from './CitedDocuments.module.css';

function meta(document: CitedDocument): string | undefined {
  const details = document.details.map((detail) => `${detail.displayName}: ${detail.value}`);
  return details.length > 0 ? details.join(' · ') : undefined;
}

/**
 * A2-UI component for `cited-documents`: the documents an answer cites, each under the label the
 * answer's text cites it by, its title linking to it, and its details on the line below.
 * Presentational, no actions. The generic binder resolves `documents`; until it does, nothing shows.
 */
export const CitedDocuments = createReactComponent(
  {
    name: 'CitedDocuments',
    schema: CitedDocumentsPropsSchema,
  },
  ({props}) => {
    const headingId = useId();
    const documents = Array.isArray(props.documents) ? props.documents : [];
    if (documents.length === 0) {
      return null;
    }
    const rows = documents.map((document) => ({
      lead: `[${document.label}]`,
      title: document.title,
      href: document.clickUri,
      meta: meta(document),
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
);
