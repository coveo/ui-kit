import {PartialDocumentInformation} from 'coveo.analytics';
import {ProductListingAnalyticsProvider} from '../../api/analytics/product-listing-analytics';
import {ProductRecommendation} from '../../product-listing.index';
import {ProductListingAppState} from '../../state/product-listing-app-state';
import {
  AnalyticsType,
  ClickAction,
  makeAnalyticsAction,
  ProductListingAction,
  validateProductRecommendationPayload,
} from '../analytics/analytics-utils';
import {getPipelineInitialState} from '../pipeline/pipeline-state';

export const logProductListing = (): ProductListingAction =>
  makeAnalyticsAction(
    'analytics/productListing/load',
    AnalyticsType.Search,
    (client) => client.makeInterfaceLoad(),
    (getState) => new ProductListingAnalyticsProvider(getState)
  );

export const logDocumentOpen = (
  productRec: ProductRecommendation
): ClickAction =>
  makeAnalyticsAction(
    'analytics/productListing/open',
    AnalyticsType.Click,
    (client, state) => {
      validateProductRecommendationPayload(productRec);
      return client.makeDocumentOpen(
        partialProductRecommendationInformation(productRec, state),
        {
          contentIDKey: 'permanentid',
          contentIDValue: productRec.permanentid,
        }
      );
    }
  );

export const partialProductRecommendationInformation = (
  productRec: ProductRecommendation,
  state: Partial<ProductListingAppState>
): PartialDocumentInformation => {
  const paginationBasedIndex = (index: number) =>
    index + (state.pagination?.firstResult ?? 0);

  let productRecIndex = -1;

  const parentResults = state.productListing?.products;
  productRecIndex = findPositionWithPermanentid(productRec, parentResults);

  if (productRecIndex < 0) {
    productRecIndex = findPositionInChildResults(productRec, parentResults);
  }

  if (productRecIndex < 0) {
    // ¯\_(ツ)_/¯
    productRecIndex = 0;
  }

  return buildPartialProductRecommendationInformation(
    productRec,
    paginationBasedIndex(productRecIndex)
  );
};

function findPositionWithPermanentid(
  targetProductRec: ProductRecommendation,
  productRecs: ProductRecommendation[] = []
) {
  return productRecs.findIndex(
    ({permanentid}) => permanentid === targetProductRec.permanentid
  );
}

function findPositionInChildResults(
  targetProductRec: ProductRecommendation,
  parentResults: ProductRecommendation[] = []
) {
  for (const [i, parent] of parentResults.entries()) {
    const children = parent.childResults;
    const childIndex = findPositionWithPermanentid(targetProductRec, children);
    if (childIndex !== -1) {
      return i;
    }
  }

  return -1;
}

function buildPartialProductRecommendationInformation(
  productRec: ProductRecommendation,
  resultIndex: number
): PartialDocumentInformation {
  return {
    collectionName: '',
    documentAuthor: '',
    documentPosition: resultIndex + 1,
    documentTitle: productRec.ec_name || '',
    documentUri: productRec.documentUri,
    documentUriHash: productRec.documentUriHash,
    documentUrl: productRec.clickUri,
    rankingModifier: '',
    sourceName: '',
    queryPipeline: getPipelineInitialState(),
  };
}
