import {useEffect, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchInstantProductsPayload, InstantProductsState} from '@coveo/thermidor-schema';
import {InstantProductsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {A2UIProductCard} from '../ProductCard/ProductCard.js';
import {useSearchBoxQuery} from '../SearchBox/search-box-context.js';
import {InstantProductsSkeleton} from '../Skeleton/Skeleton.js';
import styles from './InstantProducts.module.css';

/** The viewports wide enough to show products beside the suggestions. */
export const PRODUCTS_PANEL_MEDIA_QUERY = '(min-width: 640px)';

/**
 * How long a highlight waits for its products before the panel says there are none. A failed
 * request is only a development warning in the session, so the renderer cannot tell it apart from
 * a slow one.
 */
export const INSTANT_PRODUCTS_TIMEOUT_MS = 5000;

/** Whether the screen is wide enough for the products panel; small screens show suggestions only. */
export function useShowProductsPanel(): boolean {
  return useMediaQuery(PRODUCTS_PANEL_MEDIA_QUERY);
}

/**
 * A2-UI component for `InstantProducts`: the products of its `SearchBox`'s highlighted suggestion,
 * beside the suggestions. Each highlight is sent with `fetchInstantProducts`, unless it is empty,
 * the input was submitted, or the screen is too small for the panel. Whether an answer is reused,
 * and whether it waits for the session, is the session's.
 *
 * The panel holds its place from the first highlight, so the dropdown does not shift when products
 * arrive: a skeleton until the first answer, then the previous products, dimmed, until the
 * highlighted query's answer. Products answering another query than the highlighted one are never
 * shown as current.
 */
export const InstantProducts = createReactComponent(
  {name: 'InstantProducts', schema: InstantProductsPropsSchema},
  ({props, context}) => {
    const {highlightedQuery, submitted} = useSearchBoxQuery();
    const showProducts = useShowProductsPanel();
    const active = showProducts && !submitted && highlightedQuery !== '';
    const answered = props.query === highlightedQuery;
    const [previous, setPrevious] = useState<InstantProductsState>();
    const [timedOutQuery, setTimedOutQuery] = useState<string>();

    useEffect(() => {
      if (!active) {
        return;
      }
      const payload: FetchInstantProductsPayload = {query: highlightedQuery};
      context.dispatchAction({event: {name: 'fetchInstantProducts', context: payload}});
    }, [active, context, highlightedQuery]);

    useEffect(() => {
      if (answered && props.products.length > 0 && previous?.query !== props.query) {
        setPrevious({query: props.query, products: props.products});
      }
    }, [answered, previous?.query, props.query, props.products]);

    useEffect(() => {
      if (!active || answered) {
        return;
      }
      const timeout = setTimeout(
        () => setTimedOutQuery(highlightedQuery),
        INSTANT_PRODUCTS_TIMEOUT_MS
      );
      return () => {
        clearTimeout(timeout);
        setTimedOutQuery(undefined);
      };
    }, [active, answered, highlightedQuery]);

    if (!active) {
      return null;
    }
    if (
      (answered && props.products.length === 0) ||
      (!answered && timedOutQuery === highlightedQuery)
    ) {
      return (
        <section className={styles.panel} aria-label={`No products for ${highlightedQuery}`}>
          <PanelHeader title={`No products for “${highlightedQuery}”`} />
        </section>
      );
    }
    if (answered) {
      return (
        <section className={styles.panel} aria-label={`Products for ${props.query}`}>
          <PanelHeader title={`Products for “${props.query}”`} />
          <ProductGrid products={props.products} />
        </section>
      );
    }
    return (
      <section
        className={styles.panel}
        aria-label={`Loading products for ${highlightedQuery}`}
        aria-busy
      >
        <PanelHeader title={`Products for “${highlightedQuery}”`} />
        {previous ? (
          <div className={styles.stale}>
            <ProductGrid products={previous.products} />
          </div>
        ) : (
          <InstantProductsSkeleton />
        )}
      </section>
    );
  }
);

function PanelHeader({title}: {title: string}) {
  return (
    <div className={styles.header}>
      <span className={styles.headerTitle}>{title}</span>
    </div>
  );
}

function ProductGrid({products}: {products: InstantProductsState['products']}) {
  return (
    <div className={styles.grid} role="list">
      {products.map((product) => (
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
  );
}
