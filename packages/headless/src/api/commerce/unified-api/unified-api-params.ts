import {URLPath} from '../../../utils/url-utils';
import {pickNonBaseParams} from '../../api-client-utils';
import {BaseParam} from '../../platform-service-params';

export interface PlacementIdParam {
  placementId: string;
}

export interface ImplementationIdParam {
  implementationId?: string;
}

export interface ModeParam {
  mode?: 'LIVE' | 'SAMPLE' | 'PREVIEW' | 'NONE';
}

export interface PreviewOptsParam {
  previewOpts?: {
    campaignId: string;
    experienceId?: string;
    testGroup?: string;
  };
}

export interface UserParam {
  user?: {
    email: string;
    id: string;
    membershipType: string;
  };
}

export interface ViewParam {
  view?: {
    currency: string;
    locale: string;
    subtype?: string[];
    type: string;
  };
}

export interface VisitorParam {
  visitor?: {
    firstViewTime?: string;
    ipAddress?: string;
    lastViewTime?: string;
    location?: string;
    sessionNumber?: number;
    viewNumber?: number;
  };
}

export interface ClientIdParam {
  clientId: string;
}

export interface SeedsParam {
  seeds: {
    ids: string[];
    src: 'cart' | 'order' | 'pdp' | 'plp' | 'recs' | 'search';
  }[];
}

export const baseUnifiedAPIRequest = (
  req: BaseParam & ImplementationIdParam & ModeParam,
  path: string
) => {
  const url = new URLPath(
    `${req.url}/rest/organizations/${req.organizationId}/commerce/v2${
      path ?? ''
    }`
  );

  url.addParam('organizationId', req.organizationId);
  if (req.implementationId) {
    url.addParam('implementationId', req.implementationId);
  }
  if (req.mode) {
    url.addParam('mode', req.mode);
  }
  return {
    accessToken: req.accessToken,
    url: url.href,
    origin: 'commerceUnifiedApiFetch' as const,
  };
};

export function pickNonBaseUnifiedAPIParams<
  Params extends BaseParam & ImplementationIdParam & ModeParam
>(req: Params) {
  const {implementationId, mode, ...nonBase} = pickNonBaseParams(req);
  return nonBase;
}
