import {CommerceUnifiedAPIErrorResponse} from '../../api/commerce/unified-api/unified-api-client';
import {Badges, Placement, Recommendations} from './placement-set-interface';

type PlacementError = {error?: CommerceUnifiedAPIErrorResponse};

export type PlacementSetState = {
  badges: Record<string, Badges & PlacementError>;
  recs: Record<string, Recommendations & PlacementError>;
};

export function getPlacementSetInitialState(): PlacementSetState {
  return {
    badges: {},
    recs: {},
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
