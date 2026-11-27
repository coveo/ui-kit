import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {createComponentImplementation} from '@a2ui/react';
import type {FetchInstantProductsPayload, InstantProductsState} from '@coveo/thermidor-schema';
import {InstantProductsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {
  ActiveAsideOptionContext,
  ASIDE_LISTBOX_ID,
} from '../../components/SuggestionsDropdown/index.js';
import {useMediaQuery} from '../../hooks/use-media-query.js';
import {formatConfiguredPrice as formatPrice} from '../../context/format-configured-price.js';
import {useSearchBoxQuery} from '../SearchBox/search-box-context.js';
import {ProductChildren} from '../ProductChildren/ProductChildren.js';
import {usePromotedProduct} from '../ProductChildren/use-promoted-product.js';
import {InstantProductsSkeleton} from '../Skeleton/Skeleton.js';
import {useDispatchOutcome, useIsConcurrent, type NodeAction} from '../session-request.js';
import styles from './InstantProducts.module.css';

/** The viewports wide enough to show products beside the suggestions. */
export const PRODUCTS_PANEL_MEDIA_QUERY = '(min-width: 640px)';

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
 * it is empty, the input was submitted, or the screen is too small for the panel. The panel shows
 * only while the session sends `fetchInstantProducts` concurrently, beside the turn: a producer that
 * doesn't announce it gets no products request. Whether an answer is reused is the session's.
 *
 * The panel holds its place from the first highlight, so the dropdown does not shift when products
 * arrive: a skeleton until the first answer, then the previous products, dimmed and inert, until
 * the highlighted query's answer. Products answering another query than the highlighted one are never
 * shown as current. When the session reports, once its dispatch resolves, that the highlighted
 * query's products failed, the panel says there are none until the highlight moves or the query is
 * sent again.
 */
export const InstantProducts = createComponentImplementation(
  {name: 'InstantProducts', schema: InstantProductsPropsSchema},
  // TODO(a2ui-react context): `context` is deprecated in @a2ui/react 0.16. Build this through
  // `view({node, buildChild})` (or a shared helper): props from `useNodeView`, and dispatch with
  // `useA2uiSurface()?.dispatchAction(action, node.componentId)`.
  ({props, context}) => {
    const {highlightedQuery, submitted} = useSearchBoxQuery();
    const showProducts = useShowProductsPanel();
    const surfaceId = context.dataContext.surface?.id;
    const nodeId = context.componentModel.id;
    const fetchProducts = useMemo<NodeAction | undefined>(
      () =>
        surfaceId === undefined
          ? undefined
          : {surfaceId, sourceComponentId: nodeId, name: 'fetchInstantProducts'},
      [surfaceId, nodeId]
    );
    const concurrent = useIsConcurrent(fetchProducts);
    const active = concurrent && showProducts && !submitted && highlightedQuery !== '';
    const answered = props.query === highlightedQuery;
    const [previous, setPrevious] = useState<InstantProductsState>();
    if (answered && props.products.length > 0 && previous?.query !== props.query) {
      setPrevious({query: props.query, products: props.products});
    }
    // A highlight that moves forgets its failure: back on a failed query, the panel loads until it
    // is sent again.
    const [failedQuery, setFailedQuery] = useState<string>();
    if (failedQuery !== undefined && failedQuery !== highlightedQuery) {
      setFailedQuery(undefined);
    }
    const dispatchOutcome = useDispatchOutcome();
    // Bumped on each send and each highlight change: an outcome read after either is stale.
    const outcomeEpoch = useRef(0);

    useEffect(() => {
      outcomeEpoch.current++;
      if (!active || fetchProducts === undefined) {
        return;
      }
      const query = highlightedQuery;
      const settled = setTimeout(() => {
        const payload: FetchInstantProductsPayload = {query};
        setFailedQuery(undefined);
        const epoch = ++outcomeEpoch.current;
        void dispatchOutcome(fetchProducts, () =>
          context.dispatchAction({event: {name: 'fetchInstantProducts', context: payload}})
        ).then((outcome) => {
          if (outcome === 'failed' && epoch === outcomeEpoch.current) {
            setFailedQuery(query);
          }
        });
      }, INSTANT_PRODUCTS_SETTLE_MS);
      return () => clearTimeout(settled);
    }, [active, context, dispatchOutcome, fetchProducts, highlightedQuery]);

    if (!active) {
      return null;
    }
    if (
      (answered && props.products.length === 0) ||
      (!answered && failedQuery === highlightedQuery)
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
        return (
          <ProductRow
            key={product.permanentid}
            product={product}
            optionId={optionId}
            active={optionId === activeOptionId}
          />
        );
      })}
    </div>
  );
}

function ProductRow({
  product: listed,
  optionId,
  active,
}: {
  product: InstantProduct;
  optionId: string;
  active: boolean;
}) {
  const [product, promote] = usePromotedProduct(listed);
  const image = product.ec_images?.[0];
  const price = product.ec_promo_price ?? product.ec_price;
  return (
    <div
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
        <span className={styles.name} title={product.ec_name}>
          {product.ec_name}
        </span>
        {product.ec_brand && <span className={styles.brand}>{product.ec_brand}</span>}
        <ProductChildren product={product} onPromote={promote} presentational />
      </div>
      {price !== undefined && <span className={styles.price}>{formatPrice(price)}</span>}
    </div>
  );
}
