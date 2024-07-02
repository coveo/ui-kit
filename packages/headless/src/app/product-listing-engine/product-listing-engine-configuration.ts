import {
  BooleanValue,
  RecordValue,
  Schema,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {
  EngineConfiguration,
  getSampleEngineConfiguration,
} from '../engine-configuration';

/**
 * The product listing engine configuration.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface ProductListingEngineConfiguration
  extends EngineConfiguration {}

const engineConfigurationDefinitions: SchemaDefinition<EngineConfiguration> = {
  organizationId: requiredNonEmptyString,
  accessToken: requiredNonEmptyString,
  platformUrl: new StringValue({
    required: false,
    emptyAllowed: false,
  }),
  name: new StringValue({
    required: false,
    emptyAllowed: false,
  }),
  analytics: new RecordValue({
    options: {
      required: false,
    },
    values: {
      enabled: new BooleanValue({
        required: false,
      }),
      originContext: new StringValue({
        required: false,
      }),
      originLevel2: new StringValue({
        required: false,
      }),
      originLevel3: new StringValue({
        required: false,
      }),
      analyticsMode: new StringValue<'legacy'>({
        constrainTo: ['legacy'],
        required: false,
      }),
    },
  }),
};

export const productListingEngineConfigurationSchema =
  new Schema<ProductListingEngineConfiguration>({
    ...engineConfigurationDefinitions,
  });

/**
 * Creates a sample product listing engine configuration.
 * @deprecated The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 *
 * @returns The sample product listing engine configuration.
 */
export function getSampleProductListingEngineConfiguration(): ProductListingEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
  };
}
