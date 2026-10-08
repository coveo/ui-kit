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

/**
 * A2-UI component for `QuerySuggestions`: the completions and product suggestions for the query
 * typed in the header. Reads its resolved state from `props`.
 */
export const QuerySuggestions = createReactComponent(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  ({props}) => {
    const ui = useStorefrontUi();
    const completions = (props.completions ?? []) as QueryCompletion[];
    const products = (props.products ?? []) as Product[];

    if (completions.length === 0 && products.length === 0) {
      return <p className={styles.empty}>No suggestions for “{props.query}”.</p>;
    }

    return (
      <div className={styles.container}>
        {completions.length > 0 && (
          <ul className={styles.completions} aria-label="Query suggestions">
            {completions.map((completion) => (
              <li key={completion.expression}>
                <button
                  type="button"
                  className={styles.completion}
                  onClick={() => ui.selectCompletion(completion.expression)}
                >
                  {completion.expression}
                </button>
              </li>
            ))}
          </ul>
        )}
        {products.length > 0 && (
          <ul className={styles.products} aria-label="Product suggestions">
            {products.map((product) => (
              <li key={product.permanentid} className={styles.product}>
                {product.ec_images?.[0] && (
                  <img className={styles.image} src={product.ec_images[0]} alt="" loading="lazy" />
                )}
                <span className={styles.name}>{product.ec_name}</span>
                {product.ec_price !== undefined && product.ec_price !== null && (
                  <span className={styles.price}>{formatPrice(product.ec_price)}</span>
                )}
                <button
                  type="button"
                  className={styles.add}
                  onClick={() =>
                    ui.addToCart({
                      productId: product.permanentid,
                      name: product.ec_name,
                      price: product.ec_promo_price ?? product.ec_price ?? undefined,
                    })
                  }
                  aria-label={`Add ${product.ec_name} to cart`}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
