import {Product} from '../../../../api/commerce/common/product';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {productClick} from '../../../../features/commerce/product/product-actions';
import {
  buildInteractiveResultCore,
  InteractiveResultCore,
  InteractiveResultCoreOptions as InteractiveProductCoreOptions,
  InteractiveResultCoreProps as InteractiveResultHeadlessCoreProps,
} from '../../../core/interactive-result/headless-core-interactive-result';

export interface InteractiveProductOptions
  extends InteractiveProductCoreOptions {
  /**
   * The product to log analytics for.
   */
  product: Product;
}

export interface InteractiveProductCoreProps
  extends InteractiveResultHeadlessCoreProps {
  /**
   * The options for the `InteractiveResult` controller.
   */
  options: InteractiveProductOptions;

  /**
   * The selector to fetch the response ID from the state.
   */
  responseIdSelector: (state: CommerceEngineState) => string;
}

export type InteractiveProductProps = Omit<
  InteractiveProductCoreProps,
  'responseIdSelector'
>;

/**
 * The `InteractiveProduct` controller provides an interface for handling long presses, multiple clicks, etc. to ensure
 * analytics events are logged properly when a user selects a product.
 */
export interface InteractiveProduct extends InteractiveResultCore {
  warningMessage?: string;
}

/**
 * Creates an `InteractiveProduct` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `InteractiveProduct` properties.
 * @returns An `InteractiveProduct` controller instance.
 */
export function buildCoreInteractiveProduct(
  engine: CommerceEngine,
  props: InteractiveProductCoreProps
): InteractiveProduct {
  let wasOpened = false;

  const getWarningMessage = () => {
    const messageSegment = (
      property: string,
      lookupFields: string[],
      fallback: string
    ) =>
      `- Could not retrieve '${property}' analytics property from field${lookupFields.length > 1 ? 's' : ''} \
'${lookupFields.join("', '")}'; fell back to ${fallback}.`;

    const warnings = [];

    const {ec_name, ec_promo_price, ec_price, ec_product_id} =
      props.options.product;
    if (!ec_name) {
      warnings.push(messageSegment('name', ['ec_gender'], 'permanentid'));
    }
    if (!ec_promo_price && !ec_price) {
      warnings.push(
        messageSegment('price', ['ec_promo_price', 'ec_price'], 'NaN')
      );
    }
    if (!ec_product_id) {
      warnings.push(
        messageSegment('productId', ['ec_product_id'], 'permanentid')
      );
    }

    if (warnings.length === 0) {
      return;
    }

    return `Some required analytics properties could not be retrieved from the expected fields for product with \
permanentid '${props.options.product.permanentid}':\n\n${warnings.join('\n')}\n\nReview the configuration of the above \
'ec_'-prefixed fields in your index, and make sure they contain the correct metadata.`;
  };

  const logAnalyticsIfNeverOpened = () => {
    if (wasOpened) {
      return;
    }
    wasOpened = true;
    engine.dispatch(
      productClick({
        product: {
          name:
            props.options.product.ec_name ?? props.options.product.permanentid,
          price:
            props.options.product.ec_promo_price ??
            props.options.product.ec_price ??
            NaN,
          productId:
            props.options.product.ec_product_id ??
            props.options.product.permanentid,
        },
        position: props.options.product.position,
        responseId: props.responseIdSelector(engine[stateKey]),
      })
    );
  };

  return {
    ...buildInteractiveResultCore(engine, props, logAnalyticsIfNeverOpened),
    warningMessage: getWarningMessage(),
  };
}
