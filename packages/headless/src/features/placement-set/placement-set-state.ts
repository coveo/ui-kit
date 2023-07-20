import {CommerceUnifiedAPIErrorResponse} from '../../api/commerce/unified-api/unified-api-client';
import {
  Badges,
  Placement,
  PlacementSetSkus,
  PlacementSetView,
  Recommendations,
} from './placement-set-interface';

type PlacementError = {error?: CommerceUnifiedAPIErrorResponse};

export type PlacementSetState = {
  implementationId: '';
  badges: Record<string, Badges & PlacementError>;
  recommendations: Record<string, Recommendations & PlacementError>;
  skus: PlacementSetSkus;
  view: PlacementSetView;
};

export function getPlacementSetInitialState(): PlacementSetState {
  return {
    implementationId: '',
    badges: {},
    recommendations: {},
    skus: {
      cart: [],
      product: '',
      plp: [],
      search: [],
      order: [],
      recs: [],
    },
    view: {
      type: '',
      currency: '',
      locale: '',
      subtype: [],
    },
  };
}

function getPlacementInitialState(): Placement {
  return {
    callbackData: '',
    campaignId: '',
    clientId: '',
  };
}

export function getBadgesInitialState(): Badges {
  return {
    ...getPlacementInitialState(),
    badges: [],
  };
}

export function getRecsInitialState(): Recommendations {
  return {
    ...getPlacementInitialState(),
    products: [],
  };
}
