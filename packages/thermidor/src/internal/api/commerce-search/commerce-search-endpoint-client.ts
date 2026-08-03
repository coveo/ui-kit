import {CommerceSearchRequest, CommerceSearchResponse} from './commerce-search-endpoint-types.js';
import {executeHttpRequest} from '@/src/internal/api/protocol/http.js';
import {transformError} from '@/src/internal/api/protocol/error-handling.js';
import {getOrganizationEndpoint} from '@/src/internal/api/organization-endpoint.js';

const createCallCommerceSearchEndpoint = (): CommerceSearchEndpointClient['call'] => {
  return async (
    request: CommerceSearchRequest,
    configuration: CommerceSearchEndpointClientConfiguration,
    options?: CommerceSearchEndpointCallOptions
  ): Promise<CommerceSearchEndpointClientResult> => {
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
      const url = `${organizationEndpoint}/rest/organizations/${organizationId}/commerce/v2/search`;

      const httpResponse = await executeHttpRequest<CommerceSearchResponse>({
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
          error: httpResponse.error || 'Commerce search request failed.',
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

export const createCommerceSearchEndpointClient = (): CommerceSearchEndpointClient => {
  return {
    call: createCallCommerceSearchEndpoint(),
  };
};

export interface CommerceSearchEndpointClientConfiguration {
  organizationId?: string;
  accessToken?: string;
  endpoint?: string;
}

export type CommerceSearchEndpointClientResult =
  | {
      success: true;
      data?: CommerceSearchResponse;
    }
  | {
      success: false;
      error: string;
    };

export interface CommerceSearchEndpointCallOptions {
  signal?: AbortSignal;
}

export interface CommerceSearchEndpointClient {
  call: (
    request: CommerceSearchRequest,
    configuration: CommerceSearchEndpointClientConfiguration,
    options?: CommerceSearchEndpointCallOptions
  ) => Promise<CommerceSearchEndpointClientResult>;
}
