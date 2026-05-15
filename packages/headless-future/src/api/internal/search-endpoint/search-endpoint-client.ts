import {
  CoveoSearchEndpointRequest,
  CoveoSearchEndpointResponse,
  SearchEndpointClient,
  SearchEndpointClientResult,
} from '@/src/api/interface/search-endpoint/search-endpoint-types.js';
import {executeHttpRequest} from '@/src/api/internal/protocol/http.js';
import {FullEngine} from '@/src/core/index.js';
import * as configurationSelectors from '@/src/core/interface/configuration/configuration-selectors.js';

const DEFAULT_COVEO_ENDPOINT = 'https://platform.cloud.coveo.com';

const createCallSearchEndpoint = (
  engine: FullEngine
): SearchEndpointClient['call'] => {
  return async (
    request: CoveoSearchEndpointRequest
  ): Promise<SearchEndpointClientResult> => {
    const organizationId = engine.read(configurationSelectors.organizationId);
    const accessToken = engine.read(configurationSelectors.accessToken);
    const endpoint = engine.read(configurationSelectors.endpoint);

    if (!organizationId) {
      return {
        success: false,
        error:
          'Configuration error: Organization ID is not set. Please configure your organization ID.',
      };
    }

    if (!accessToken) {
      return {
        success: false,
        error:
          'Configuration error: Access token is not set. Please configure your access token.',
      };
    }

    const baseEndpoint = endpoint || DEFAULT_COVEO_ENDPOINT;
    const url = `${baseEndpoint}/rest/search/v2`;

    const httpResponse = await executeHttpRequest<CoveoSearchEndpointResponse>({
      url,
      method: 'POST',
      body: request,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Coveo-Organization-Id': organizationId,
      },
    });

    if (!httpResponse.success) {
      return {
        success: false,
        error: httpResponse.error || 'Search request failed.',
      };
    }

    return {
      success: true,
      data: httpResponse.data,
    };
  };
};

export const createSearchEndpointClient = (
  engine: FullEngine
): SearchEndpointClient => {
  return {
    call: createCallSearchEndpoint(engine),
  };
};

export async function callSearchEndpoint(
  engine: FullEngine,
  request: CoveoSearchEndpointRequest
): Promise<SearchEndpointClientResult> {
  return createSearchEndpointClient(engine).call(request);
}
