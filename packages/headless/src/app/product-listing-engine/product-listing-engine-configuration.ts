import {
  BooleanValue,
  RecordValue,
  Schema,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {PlatformEnvironment} from '../../utils/url-utils';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {
  EngineConfiguration,
  getSampleEngineConfiguration,
} from '../engine-configuration';

/**
 * The product listing engine configuration.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface ProductListingEngineConfiguration
  extends EngineConfiguration {}

const engineConfigurationDefinitions: SchemaDefinition<EngineConfiguration> = {
  organizationId: requiredNonEmptyString,
  accessToken: requiredNonEmptyString,
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
      proxyBaseUrl: new StringValue({
        required: false,
        url: true,
      }),
    },
  }),
  environment: new StringValue<PlatformEnvironment>({
    required: false,
    constrainTo: ['prod', 'hipaa', 'stg', 'dev'],
  }),
};

export const productListingEngineConfigurationSchema =
  new Schema<ProductListingEngineConfiguration>({
    ...engineConfigurationDefinitions,
  });

/**
 * Creates a sample product listing engine configuration.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 *
 * @returns The sample product listing engine configuration.
 */
export function getSampleProductListingEngineConfiguration(): ProductListingEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
  };
}
