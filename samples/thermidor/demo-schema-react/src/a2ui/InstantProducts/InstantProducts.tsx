import {useEffect, useMemo, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchInstantProductsPayload, InstantProductsState} from '@coveo/thermidor-schema';
import {InstantProductsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {
  ASIDE_LISTBOX_ID,
  optionLabel,
  useSuggestionsAside,
  type AsideItem,
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

type InstantProduct = InstantProductsState['products'][number];

/** Opens the product's page in a new tab, by click or by Enter on its highlight. */
function openProduct(clickUri: string | undefined) {
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
 * beside the suggestions. Each highlight is sent with `fetchInstantProducts`, unless it is empty,
 * the input was submitted, or the screen is too small for the panel. Whether an answer is reused,
 * and whether it waits for the session, is the session's.
 *
 * The panel holds its place from the first highlight, so the dropdown does not shift when products
 * arrive: a skeleton until the first answer, then the previous products, dimmed and inert, until
 * the highlighted query's answer. Products answering another query than the highlighted one are never
 * shown as current.
 *
 * The current products are a list the arrow keys reach from the highlighted suggestion; Enter opens
 * the highlighted one, as a click does.
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
      context.dispatchAction({event: {name: 'fetchInstantProducts', context: payload}});
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
          <ProductList products={props.products} />
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
            <ProductRows products={previous.products} />
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

/** The current products, which the arrow keys reach from the suggestions. */
function ProductList({products}: {products: InstantProduct[]}) {
  const {showItems, activeItemId, hoverItem, selectItem} = useSuggestionsAside();
  // Every replay of the stream rebuilds `products`, so the items follow their ids and links.
  const itemsKey = JSON.stringify(
    products.map(({permanentid, clickUri}) => [permanentid, clickUri])
  );
  const items = useMemo<AsideItem[]>(() => {
    const links = JSON.parse(itemsKey) as [string, string | undefined][];
    return links.map(([permanentid, clickUri]) => ({
      id: productOptionId(permanentid),
      onSelect: () => openProduct(clickUri),
    }));
  }, [itemsKey]);

  useEffect(() => showItems(items), [showItems, items]);
  useEffect(() => () => showItems([]), [showItems]);

  return (
    <div id={ASIDE_LISTBOX_ID} className={styles.list} role="listbox" aria-label="Instant products">
      {products.map((product, index) => {
        const item = items[index];
        return (
          <ProductRow
            key={product.permanentid}
            product={product}
            id={item.id}
            label={optionLabel(
              `${product.ec_name ?? 'Product'}, instant product`,
              index + 1,
              products.length,
              'Right'
            )}
            active={item.id === activeItemId}
            onHover={() => hoverItem(item)}
            onSelect={() => selectItem(item)}
          />
        );
      })}
    </div>
  );
}

/** The previous products, drawn inert while the highlighted query's answer loads. */
function ProductRows({products}: {products: InstantProduct[]}) {
  return (
    <div className={styles.list}>
      {products.map((product) => (
        <ProductRow key={product.permanentid} product={product} />
      ))}
    </div>
  );
}

function productOptionId(permanentid: string): string {
  return `instant-product-${permanentid}`;
}

interface ProductRowProps {
  product: InstantProduct;
  id?: string;
  label?: string;
  active?: boolean;
  onHover?: () => void;
  onSelect?: () => void;
}

function ProductRow({product, id, label, active = false, onHover, onSelect}: ProductRowProps) {
  const image = product.ec_images?.[0];
  const price = product.ec_promo_price ?? product.ec_price;
  return (
    <div
      id={id}
      className={`${styles.row} ${active ? styles.active : ''}`}
      role={id ? 'option' : undefined}
      aria-selected={id ? active : undefined}
      aria-label={label}
      onMouseEnter={onHover}
      onClick={onSelect}
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
}
