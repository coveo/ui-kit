import {useId} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {ProductResearchCardPropsSchema} from '@coveo/thermidor-schema/zod3';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import {A2UISkeleton} from '../Skeleton/Skeleton.js';
import {
  DEFAULT_MAX_LINKS,
  RelatedDocumentList,
  toLinkLimit,
  visibleDocuments,
} from '../RelatedDocuments/RelatedDocumentList.js';
import styles from './ProductResearchCard.module.css';

export interface ProductResearchCardOptions {
  /**
   * Most related documents the card lists, in the order the agent sent them. Fractions round down;
   * `0`, a negative number or `NaN` hides the list, and `Infinity` lists every document.
   */
  maxLinks?: number;
}

/**
 * Builds the A2-UI component for the `product-research-card`: a single researched product shown
 * next to a short research summary and a list of product-education bullets. When the agent sends
 * related documents, a "Documentation & manuals" section lists them under the card, one row each.
 * The generic binder resolves `product` / `summary` / `bullets` / `relatedDocuments` from
 * `ProductResearchCardPropsSchema`. Presentational —
 * no actions. `product`, `summary` and `bullets` resolve independently, so any of them still
 * `undefined` renders the research skeleton: the conversation drops its own skeleton as soon as the
 * surface is created, before the state arrives. `relatedDocuments` is optional and never holds the
 * card in its loading state.
 */
export function createProductResearchCard({
  maxLinks = DEFAULT_MAX_LINKS,
}: ProductResearchCardOptions = {}) {
  const linkLimit = toLinkLimit(maxLinks);

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
      const documents = visibleDocuments(relatedDocuments, linkLimit);

      return (
        <div className={styles.root}>
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
            </div>
          </article>
          {documents.length > 0 && (
            <section className={styles.documents} aria-labelledby={documentsHeadingId}>
              <h3 id={documentsHeadingId} className={styles.documentsHeading}>
                Documentation &amp; manuals
              </h3>
              <RelatedDocumentList documents={documents} />
            </section>
          )}
        </div>
      );
    }
  );
}
