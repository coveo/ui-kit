/**
 * Defines the content of a successful response from the `/classify` call.
 *
 * See  https://platform.cloud.coveo.com/docs?urls.primaryName=Customer%20Service#/Suggestions/postClassify
 */
export interface GetCaseClassificationsResponse {
  fields: {
    [fieldName: string]: {
      predictions: [
        {
          id: string;
          value: string;
          confidence: number;
        }
      ];
    };
  };
  responseId: string;
}
