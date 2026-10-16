import {useId} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {ProductResearchCardPropsSchema} from '@coveo/thermidor-schema/zod3';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import {A2UISkeleton} from '../Skeleton/Skeleton.js';
import styles from './ProductResearchCard.module.css';

const DEFAULT_MAX_LINKS = 10;

export interface ProductResearchCardOptions {
  /**
   * Most related documents the card lists, in the order the agent sent them. Fractions round down;
   * `0`, a negative number or `NaN` hides the list, and `Infinity` lists every document.
   */
  maxLinks?: number;
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** Formats a size in bytes with a binary unit and one decimal, e.g. `1.5 MB`; `''` when invalid. */
export function formatDocumentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '';
  }
  let size = bytes;
  let unit = 0;
  while (unit < SIZE_UNITS.length - 1 && Number(size.toFixed(1)) >= 1024) {
    size /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 ? size : Number(size.toFixed(1));
  return `${rounded} ${SIZE_UNITS[unit]}`;
}

/**
 * Builds the A2-UI component for the `product-research-card`: a single researched product shown
 * next to a short research summary, a list of product-education bullets and, when the agent sends
 * them, links to the product's related documents. The generic binder resolves `product` /
 * `summary` / `bullets` / `relatedDocuments` from `ProductResearchCardPropsSchema`. Presentational —
 * no actions. `product`, `summary` and `bullets` resolve independently, so any of them still
 * `undefined` renders the research skeleton: the conversation drops its own skeleton as soon as the
 * surface is created, before the state arrives. `relatedDocuments` is optional and never holds the
 * card in its loading state.
 */
export function createProductResearchCard({
  maxLinks = DEFAULT_MAX_LINKS,
}: ProductResearchCardOptions = {}) {
  const linkLimit = Number.isNaN(maxLinks) ? 0 : Math.max(0, Math.floor(maxLinks));

  return createReactComponent(
    {
      name: 'ProductResearchCard',
      schema: ProductResearchCardPropsSchema,
    },
    ({props}) => {
      const {product, summary, bullets, relatedDocuments} = props;
      const documentsHeadingId = useId();
      if (product === undefined || summary === undefined || bullets === undefined) {
        return <A2UISkeleton componentType="ProductResearchCard" />;
      }

      const rating =
        typeof product.ec_rating === 'number' ? Number(product.ec_rating.toFixed(1)) : null;
      // A document with neither a title nor a link has nothing to show, so it takes no slot.
      const documents = (relatedDocuments ?? [])
        .filter((document) => document.title || document.clickUri)
        .slice(0, linkLimit);

      return (
        <article className={styles.container} aria-label={`Product research: ${product.ec_name}`}>
          <div className={styles.productColumn}>
            <A2UIProductCard
              ec_name={product.ec_name}
              ec_brand={product.ec_brand}
              ec_price={product.ec_promo_price ?? product.ec_price}
              ec_image={product.ec_images?.[0]}
              ec_product_id={product.permanentid}
              clickUri={product.clickUri}
            />
            {rating !== null && (
              <span className={styles.rating} role="img" aria-label={`Rated ${rating} out of 5`}>
                ★ {rating} / 5
              </span>
            )}
          </div>
          <div className={styles.researchColumn}>
            {summary && <p className={styles.summary}>{summary}</p>}
            {bullets.length > 0 && (
              <ul className={styles.bullets}>
                {bullets.map((bullet, index) => (
                  <li key={index} className={styles.bullet}>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            {documents.length > 0 && (
              <section className={styles.relatedDocuments} aria-labelledby={documentsHeadingId}>
                <h3 id={documentsHeadingId} className={styles.relatedDocumentsHeading}>
                  Related documents
                </h3>
                <ul className={styles.documentLinks}>
                  {documents.map((document, index) => {
                    const label = document.title || document.clickUri;
                    const meta = [
                      document.filetype?.toUpperCase(),
                      document.size === undefined ? '' : formatDocumentSize(document.size),
                    ]
                      .filter(Boolean)
                      .join(' · ');
                    return (
                      <li key={index} className={styles.documentLink}>
                        {document.clickUri ? (
                          <a href={document.clickUri} target="_blank" rel="noopener noreferrer">
                            {label}
                          </a>
                        ) : (
                          <span>{label}</span>
                        )}
                        {meta && <span className={styles.documentMeta}>{meta}</span>}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </article>
      );
    }
  );
}
