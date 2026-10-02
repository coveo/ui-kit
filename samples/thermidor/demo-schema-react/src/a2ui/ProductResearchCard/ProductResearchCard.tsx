import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {ProductResearchCardPropsSchema} from '@coveo/thermidor-schema/zod3';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import {RichText} from '../RichText/RichText.js';
import {A2UISkeleton} from '../Skeleton/Skeleton.js';
import styles from './ProductResearchCard.module.css';

/**
 * A2-UI component for the `product-research-card`: a single researched product shown next to a short
 * research summary and a list of product-education bullets. The generic binder resolves `product`
 * / `summary` / `bullets` from `ProductResearchCardPropsSchema`. Presentational — no actions.
 * The three bindings resolve independently, so any of them still `undefined` renders the research
 * skeleton: the conversation drops its own skeleton as soon as the surface is created, before the
 * state arrives.
 */
export const ProductResearchCard = createReactComponent(
  {
    name: 'ProductResearchCard',
    schema: ProductResearchCardPropsSchema,
  },
  ({props}) => {
    const {product, summary, bullets} = props;
    if (product === undefined || summary === undefined || bullets === undefined) {
      return <A2UISkeleton componentType="ProductResearchCard" />;
    }

    const rating =
      typeof product.ec_rating === 'number' ? Number(product.ec_rating.toFixed(1)) : null;

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
          {summary && (
            <p className={styles.summary}>
              <RichText value={summary} />
            </p>
          )}
          {bullets.length > 0 && (
            <ul className={styles.bullets}>
              {bullets.map((bullet, index) => (
                <li key={index} className={styles.bullet}>
                  <RichText value={bullet} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    );
  }
);
