import {CoveoSearchEndpointRequest, CoveoSearchEndpointResponse} from './search-endpoint-types.js';
import {executeHttpRequest} from '@/src/internal/api/protocol/http.js';
import {transformError} from '@/src/internal/api/protocol/error-handling.js';
import {getOrganizationEndpoint} from '@/src/internal/api/organization-endpoint.js';

const createCallSearchEndpoint = (): SearchEndpointClient['call'] => {
  return async (
    request: CoveoSearchEndpointRequest,
    configuration: SearchEndpointClientConfiguration,
    options?: SearchEndpointCallOptions
  ): Promise<SearchEndpointClientResult> => {
    try {
      const {organizationId, accessToken, endpoint} = configuration;

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

      const organizationEndpoint = getOrganizationEndpoint(organizationId, {
        endpoint,
      });

      const queryParams = new URLSearchParams({
        organizationId,
      });

      const url = `${organizationEndpoint}/rest/search/v2?${queryParams}`;

      const httpResponse = await executeHttpRequest<CoveoSearchEndpointResponse>({
        url,
        method: 'POST',
        body: request,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Coveo-Organization-Id': organizationId,
        },
        signal: options?.signal,
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
    } catch (error) {
      return {
        success: false,
        error: transformError(error),
      };
    }
  };
};

export const createSearchEndpointClient = (): SearchEndpointClient => {
  return {
    call: createCallSearchEndpoint(),
  };
};

export interface SearchEndpointClientConfiguration {
  organizationId?: string;
  accessToken?: string;
  endpoint?: string;
}

export type SearchEndpointClientResult =
  | {
      success: true;
      data?: CoveoSearchEndpointResponse;
    }
  | {
      success: false;
      error: string;
    };

export interface SearchEndpointCallOptions {
  signal?: AbortSignal;
}

export interface SearchEndpointClient {
  call: (
    request: CoveoSearchEndpointRequest,
    configuration: SearchEndpointClientConfiguration,
    options?: SearchEndpointCallOptions
  ) => Promise<SearchEndpointClientResult>;
}
