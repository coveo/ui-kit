import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {Product, QueryCompletion} from '@coveo/thermidor-schema';
import {
  DataBindingSchema,
  FunctionCallSchema,
  QuerySuggestionsStateSchema,
} from '@coveo/thermidor-schema/zod3';
import {z} from 'zod';
import {formatPrice} from '../../../../demo-schema-react/src/utils.js';
import {useStorefrontUi} from '../storefront-ui.js';
import styles from './QuerySuggestions.module.css';

/**
 * The `QuerySuggestions` props schema. `@coveo/thermidor-schema` generates one but does not export
 * it yet, so it is rebuilt here from the exported state schema, the same way the generated ones are.
 */
const QuerySuggestionsPropsSchema = z.object({
  query: z.union([z.string(), DataBindingSchema, FunctionCallSchema]),
  completions: z.union([
    QuerySuggestionsStateSchema.shape.completions,
    DataBindingSchema,
    FunctionCallSchema,
  ]),
  products: z.union([
    QuerySuggestionsStateSchema.shape.products,
    DataBindingSchema,
    FunctionCallSchema,
  ]),
});

/** `text` with the part matching `query` emphasized, as search boxes usually show it. */
function Highlight({text, query}: {text: string; query: string}) {
  const needle = query.trim().toLowerCase();
  const at = needle ? text.toLowerCase().indexOf(needle) : -1;
  if (at < 0) {
    return <>{text}</>;
  }
  const end = at + needle.length;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, end)}</mark>
      {text.slice(end)}
    </>
  );
}

// Keeps the search box focused, so the popover stays open until the click lands.
const keepFocus = (event: {preventDefault(): void}) => event.preventDefault();

/**
 * A2-UI component for `QuerySuggestions`: query completions on the left, product suggestions on
 * the right. Reads its resolved state from `props`. Picking a completion or a product is
 * navigation the app owns, and adding a product updates the app's cart, so none of it is an
 * A2-UI action.
 */
export const QuerySuggestions = createReactComponent(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  ({props}) => {
    const ui = useStorefrontUi();
    const query = typeof props.query === 'string' ? props.query : '';
    const completions = (props.completions ?? []) as QueryCompletion[];
    const products = (props.products ?? []) as Product[];

    if (completions.length === 0 && products.length === 0) {
      return <p className={styles.empty}>No suggestions for “{query}”.</p>;
    }

    return (
      <div className={styles.panel}>
        <div className={styles.column}>
          <h3 className={styles.heading}>Query suggestions</h3>
          {completions.length === 0 ? (
            <p className={styles.empty}>No completion</p>
          ) : (
            <ul className={styles.list} aria-label="Query suggestions">
              {completions.map(({expression}) => (
                <li key={expression}>
                  <button
                    type="button"
                    className={styles.suggestion}
                    onMouseDown={keepFocus}
                    onClick={() => ui.selectCompletion(expression)}
                  >
                    <Highlight text={expression} query={query} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {products.length > 0 && (
          <div className={`${styles.column} ${styles.products}`}>
            <h3 className={styles.heading}>Products</h3>
            <ul className={styles.list} aria-label="Product suggestions">
              {products.map((product) => {
                const price = product.ec_promo_price ?? product.ec_price ?? undefined;
                return (
                  <li key={product.permanentid} className={styles.product}>
                    <button
                      type="button"
                      className={`${styles.suggestion} ${styles.productPick}`}
                      onMouseDown={keepFocus}
                      onClick={() => ui.selectCompletion(product.ec_name)}
                    >
                      {product.ec_images?.[0] ? (
                        <img className={styles.image} src={product.ec_images[0]} alt="" />
                      ) : (
                        <span className={styles.image} />
                      )}
                      <span>
                        <span className={styles.name}>{product.ec_name}</span>
                        {price !== undefined && (
                          <span className={styles.price}>{formatPrice(price)}</span>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles.add}
                      onMouseDown={keepFocus}
                      onClick={() =>
                        ui.addToCart({productId: product.permanentid, name: product.ec_name, price})
                      }
                      aria-label={`Add ${product.ec_name} to cart`}
                    >
                      Add
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
