import {Schema} from '@coveo/bueno';
import {DocumentIdentifier, PartialDocumentInformation} from 'coveo.analytics';
import {CommerceAnalyticsProvider} from '../../../api/analytics/commerce-analytics';
import {ProductRecommendation, Result} from '../../../product-listing.index';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {
  makeAnalyticsAction,
  resultPartialDefinition,
  ProductListingV2Action,
  makeCommerceAnalyticsAction,
} from '../../analytics/analytics-utils';

export const logProductListingV2Load = (): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/productListing/load',
    (client) => client.makeInterfaceLoad(),
    (getState) => new CommerceAnalyticsProvider(getState)
  );

export const logProductListingV2Open = (
  productRec: ProductRecommendation
): ProductListingV2Action =>
  makeAnalyticsAction(
    'analytics/commerce/productListing/open',
    (client, state) => {
      validateResultPayload(productRec);
      return client.makeDocumentOpen(
        partialRecommendationInformation(productRec, state),
        documentIdentifier(productRec)
      );
    },
    (getState) => new CommerceAnalyticsProvider(getState)
  );

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
    contentIDValue: productRecommendation.permanentid,
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

const partialRecommendationInformation = (
  result: ProductRecommendation,
  state: Partial<CommerceAppState>
): PartialDocumentInformation => {
  const resultIndex =
    state.productListing?.products.findIndex(
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
