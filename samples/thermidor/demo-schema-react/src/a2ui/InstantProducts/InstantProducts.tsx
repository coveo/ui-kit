import {useContext, useEffect, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchInstantProductsPayload, InstantProductsState} from '@coveo/thermidor-schema';
import {InstantProductsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {
  ActiveAsideOptionContext,
  ASIDE_LISTBOX_ID,
} from '../../components/SuggestionsDropdown/index.js';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {formatPrice} from '../../utils.js';
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

/**
 * How long a highlight must hold before its products are fetched, so moving quickly through the
 * suggestions sends one request, not one per suggestion.
 */
export const INSTANT_PRODUCTS_SETTLE_MS = 150;

type InstantProduct = InstantProductsState['products'][number];

function openProduct({clickUri}: InstantProduct) {
  if (clickUri) {
    window.open(clickUri, '_blank', 'noopener,noreferrer');
  }
}

/** Whether the screen is wide enough for the products panel; small screens show suggestions only. */
function useShowProductsPanel(): boolean {
  return useMediaQuery(PRODUCTS_PANEL_MEDIA_QUERY);
}

/**
 * A2-UI component for `InstantProducts`: the products of its `SearchBox`'s highlighted suggestion,
 * beside the suggestions. Each highlight that settles is sent with `fetchInstantProducts`, unless
 * it is empty, the input was submitted, or the screen is too small for the panel. Whether an answer
 * is reused, and whether it waits for the session, is the session's.
 *
 * The panel holds its place from the first highlight, so the dropdown does not shift when products
 * arrive: a skeleton until the first answer, then the previous products, dimmed and inert, until
 * the highlighted query's answer. Products answering another query than the highlighted one are never
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
    if (answered && props.products.length > 0 && previous?.query !== props.query) {
      setPrevious({query: props.query, products: props.products});
    }
    const [timedOutQuery, setTimedOutQuery] = useState<string>();

    useEffect(() => {
      if (!active) {
        return;
      }
      const payload: FetchInstantProductsPayload = {query: highlightedQuery};
      const settled = setTimeout(
        () => context.dispatchAction({event: {name: 'fetchInstantProducts', context: payload}}),
        INSTANT_PRODUCTS_SETTLE_MS
      );
      return () => clearTimeout(settled);
    }, [active, context, highlightedQuery]);

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
          <ProductList products={props.products} id={ASIDE_LISTBOX_ID} />
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
          <div className={styles.stale} inert>
            <ProductList products={previous.products} />
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

function ProductList({products, id}: {products: InstantProduct[]; id?: string}) {
  const activeOptionId = useContext(ActiveAsideOptionContext);
  return (
    <div id={id} className={styles.list} role="listbox" aria-label="Instant products">
      {products.map((product) => {
        const optionId = `instant-product-${product.permanentid}`;
        const active = optionId === activeOptionId;
        const image = product.ec_images?.[0];
        const price = product.ec_promo_price ?? product.ec_price;
        return (
          <div
            key={product.permanentid}
            id={optionId}
            className={`${styles.row} ${active ? styles.active : ''}`}
            role="option"
            aria-selected={active}
            onClick={() => openProduct(product)}
          >
            {image ? (
              <img className={styles.image} src={image} alt="" loading="lazy" />
            ) : (
              <div className={styles.image} />
            )}
            <div className={styles.content}>
              <span className={styles.name}>{product.ec_name}</span>
              {product.ec_brand && <span className={styles.brand}>{product.ec_brand}</span>}
            </div>
            {price !== undefined && <span className={styles.price}>{formatPrice(price)}</span>}
          </div>
        );
      })}
    </div>
  );
}
