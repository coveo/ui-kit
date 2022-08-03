import {
  ProductRecommendationAnalyticsProvider,
  StateNeededByProductRecommendationsAnalyticsProvider,
} from '../../api/analytics/product-recommendations-analytics';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';
import {
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  AnalyticsType,
  makeAnalyticsAction,
  resultPartialDefinition,
} from '../analytics/analytics-utils';
import {Schema} from '@coveo/bueno';
import {Result} from '../../api/search/search/result';

export const logProductRecommendations = makeAnalyticsAction(
  'analytics/productrecommendations/load',
  AnalyticsType.Search,
  (client) => client.logRecommendationInterfaceLoad(),
  (state) =>
    new ProductRecommendationAnalyticsProvider(
      state as StateNeededByProductRecommendationsAnalyticsProvider
    )
);

const partialRecommendationInformation = (
  result: ProductRecommendation,
  state: Partial<ProductRecommendationsAppState>
): PartialDocumentInformation => {
  const resultIndex =
    state.productRecommendations?.recommendations.findIndex(
      ({permanentid}) => result.permanentid === permanentid
    ) || 0;

  return buildPartialDocumentInformation(result, resultIndex);
};

function buildPartialDocumentInformation(
  productRecommendation: ProductRecommendation,
  resultIndex: number
): PartialDocumentInformation {
  return {
    collectionName: '',
    documentAuthor: '',
    documentPosition: resultIndex + 1,
    documentTitle: productRecommendation.ec_name || '',
    documentUri: productRecommendation.documentUri,
    documentUriHash: productRecommendation.documentUriHash,
    documentUrl: productRecommendation.clickUri,
    rankingModifier: '',
    sourceName: 'unknown',
    queryPipeline: '',
  };
}

const documentIdentifier = (
  productRecommendation: ProductRecommendation
): DocumentIdentifier => {
  if (!productRecommendation.permanentid) {
    console.warn(
      'Missing field permanentid on productRecommendation. This might cause many issues with your Coveo deployment. See https://docs.coveo.com/en/1913 and https://docs.coveo.com/en/1640 for more information.',
      productRecommendation
    );
  }
  return {
    contentIDKey: 'permanentid',
    contentIDValue: productRecommendation.permanentid || '',
  };
};

function mapProductRecommendationToResult(
  productRecommendation: ProductRecommendation
): Partial<Result> {
  return {
    uniqueId: productRecommendation.permanentid,
    title: productRecommendation.ec_name || '',
    uri: productRecommendation.documentUri,
    clickUri: productRecommendation.clickUri,
  };
}

function partialResultPayload(
  productRecommendation: ProductRecommendation
): Partial<ProductRecommendation> {
  const result = mapProductRecommendationToResult(productRecommendation);
  return Object.assign(
    {},
    ...Object.keys(resultPartialDefinition).map((key) => ({
      [key]: result[key as keyof typeof resultPartialDefinition],
    }))
  );
}
const validateResultPayload = (productRecommendation: ProductRecommendation) =>
  new Schema(resultPartialDefinition).validate(
    partialResultPayload(productRecommendation)
  );

export const logProductRecommendationOpen = (
  productRecommendation: ProductRecommendation
) =>
  makeAnalyticsAction(
    'analytics/productRecommendation/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(productRecommendation);
      return client.logRecommendationOpen(
        partialRecommendationInformation(productRecommendation, state),
        documentIdentifier(productRecommendation)
      );
    },
    (s) =>
      new ProductRecommendationAnalyticsProvider(
        s as StateNeededByProductRecommendationsAnalyticsProvider
      )
  )();
