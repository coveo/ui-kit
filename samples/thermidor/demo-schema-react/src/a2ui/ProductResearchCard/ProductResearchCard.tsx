import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {ProductResearchCardPropsSchema} from '@coveo/thermidor-schema/zod3';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import styles from './ProductResearchCard.module.css';

/**
 * A2-UI component for the `product-research-card`: a single researched product shown next to a short
 * research summary and a list of product-education bullets. The generic binder resolves `product`
 * / `summary` / `bullets` from `ProductResearchCardPropsSchema`. Presentational — no actions.
 * `product === undefined` (bindings not yet resolved) renders a loading state.
 */
export const ProductResearchCard = createReactComponent(
  {
    name: 'ProductResearchCard',
    schema: ProductResearchCardPropsSchema,
  },
  ({props}) => {
    if (props.product === undefined) {
      return (
        <div className={styles.loading} aria-label="Loading product research">
          Loading…
        </div>
      );
    }

    const {product} = props;
    const summary = props.summary ?? '';
    const bullets = props.bullets ?? [];
    const rating = product.ec_rating;

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
          {typeof rating === 'number' && (
            <span className={styles.rating} role="img" aria-label={`Rated ${rating} out of 5`}>
              ★ {rating} / 5
            </span>
          )}
        </div>
        <div className={styles.researchColumn}>
          {summary && <p className={styles.summary}>{summary}</p>}
          {bullets.length > 0 && (
            <ul className={styles.bullets}>
              {bullets.map((bullet) => (
                <li key={bullet} className={styles.bullet}>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    );
  }
);
