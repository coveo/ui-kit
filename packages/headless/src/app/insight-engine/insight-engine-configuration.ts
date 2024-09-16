import {RecordValue, Schema} from '@coveo/bueno';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
  getSampleEngineConfiguration,
} from '../engine-configuration';

/**
 * The insight engine configuration.
 */
export interface InsightEngineConfiguration extends EngineConfiguration {
  /**
   * Specifies the unique identifier of the target insight configuration.
   */
  insightId: string;
  /**
   * Specifies the configuration for the insight search.
   */
  search?: InsightEngineSearchConfigurationOptions;
}

/**
 * The insight engine search configuration options.
 */
export interface InsightEngineSearchConfigurationOptions {
  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   *
   * Notes:
   *  Coveo Machine Learning models use this information to provide contextually relevant output.
   *  Moreover, this information can be referred to in query expressions and QPL statements by using the $locale object.
   */
  locale?: string;
}

export const insightEngineConfigurationSchema =
  new Schema<InsightEngineConfiguration>({
    ...engineConfigurationDefinitions,
    insightId: requiredNonEmptyString,
    search: new RecordValue({
      options: {
        required: false,
      },
      values: {
        locale: nonEmptyString,
      },
    }),
  });

const sampleInsightId = '2729db39-d7fd-4504-a06e-668c64968c95';

/**
 * Creates a sample search engine configuration.
 *
 * @returns The sample search engine configuration.
 */
export function getSampleInsightEngineConfiguration(): InsightEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    insightId: sampleInsightId,
  };
}
