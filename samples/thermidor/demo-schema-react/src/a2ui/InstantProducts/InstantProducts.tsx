import {useEffect} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchInstantProductsPayload} from '@coveo/thermidor-schema';
import {InstantProductsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import {useSearchBoxQuery} from '../SearchBox/search-box-context.js';
import styles from './InstantProducts.module.css';

/** The viewports wide enough to show products beside the suggestions. */
export const PRODUCTS_PANEL_MEDIA_QUERY = '(min-width: 640px)';

/** Whether the screen is wide enough for the products panel; small screens show suggestions only. */
export function useShowProductsPanel(): boolean {
  return useMediaQuery(PRODUCTS_PANEL_MEDIA_QUERY);
}

/**
 * A2-UI component for `InstantProducts`: the products of its `SearchBox`'s highlighted suggestion,
 * beside the suggestions. Each highlight is sent with `fetchInstantProducts`, unless it is empty,
 * the input was submitted, or the screen is too small for the panel. The products show only while
 * they answer the highlighted query, so a late answer for an earlier highlight is never drawn.
 * Whether an answer is reused, and whether it waits for the session, is the session's.
 */
export const InstantProducts = createReactComponent(
  {name: 'InstantProducts', schema: InstantProductsPropsSchema},
  ({props, context}) => {
    const {highlightedQuery, submitted} = useSearchBoxQuery();
    const showProducts = useShowProductsPanel();

    useEffect(() => {
      if (!showProducts || submitted || !highlightedQuery) {
        return;
      }
      const payload: FetchInstantProductsPayload = {query: highlightedQuery};
      context.dispatchAction({event: {name: 'fetchInstantProducts', context: payload}});
    }, [context, highlightedQuery, showProducts, submitted]);

    if (!showProducts || props.query !== highlightedQuery || props.products.length === 0) {
      return null;
    }
    return (
      <section className={styles.panel} aria-label={`Products for ${props.query}`}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Products for “{props.query}”</span>
        </div>
        <div className={styles.grid} role="list">
          {props.products.map((product) => (
            <div key={product.permanentid} role="listitem">
              <A2UIProductCard
                ec_name={product.ec_name}
                ec_brand={product.ec_brand}
                ec_price={product.ec_promo_price ?? product.ec_price}
                ec_image={product.ec_images?.[0]}
                ec_product_id={product.permanentid}
                clickUri={product.clickUri}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }
);
