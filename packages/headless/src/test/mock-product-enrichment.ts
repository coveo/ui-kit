import type {
  Badge,
  BadgePlacement,
  BadgesProduct,
  ProductEnrichmentSuccessBadgesResponse,
} from '../api/commerce/product-enrichment/product-enrichment-response.js';
import type {FetchBadgesThunkReturn} from '../features/commerce/product-enrichment/product-enrichment-actions.js';

export function buildMockBadge(config: Partial<Badge> = {}): Badge {
  return {
    text: config.text ?? 'New',
    backgroundColor: config.backgroundColor ?? '#000000',
    textColor: config.textColor ?? '#FFFFFF',
    iconUrl: config.iconUrl ?? null,
  };
}

export function buildMockBadgePlacement(
  config: Partial<BadgePlacement> = {}
): BadgePlacement {
  return {
    placementId: config.placementId ?? 'placement-1',
    badges: config.badges ?? [buildMockBadge()],
  };
}

export function buildMockBadgesProduct(
  config: Partial<BadgesProduct> = {}
): BadgesProduct {
  return {
    productId: config.productId ?? 'product-1',
    badgePlacements: config.badgePlacements ?? [buildMockBadgePlacement()],
  };
}

function buildMockProductEnrichmentResponse(
  config: Partial<ProductEnrichmentSuccessBadgesResponse> = {}
): ProductEnrichmentSuccessBadgesResponse {
  return {
    products: config.products ?? [buildMockBadgesProduct()],
  };
}

export function buildFetchBadgesResponse(
  config: Partial<ProductEnrichmentSuccessBadgesResponse> = {}
): FetchBadgesThunkReturn {
  return {
    response: buildMockProductEnrichmentResponse(config),
  };
}
