import type {UnifiedEndpointRequest} from './unified-endpoint-types.js';
import {isSuccessResponse, transformError} from '@/src/internal/api/protocol/error-handling.js';
import {getOrganizationEndpoint} from '@/src/internal/api/organization-endpoint.js';

const featureFlagOverridesHeaderValue = JSON.stringify({
  'cpd-stateful-commerce-enabled': true,
});

const createCallUnifiedEndpoint = (): UnifiedEndpointClient['call'] => {
  return async (
    request: UnifiedEndpointRequest,
    configuration: UnifiedEndpointClientConfiguration,
    options?: UnifiedEndpointCallOptions
  ): Promise<UnifiedEndpointClientResult> => {
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
        endpointType: 'admin',
      });
      const url =
        organizationEndpoint +
        '/rest/organizations/' +
        organizationId +
        '/commerce/unstable/agentic/converse';

      const response = await fetch(url, {
        method: 'POST',
        signal: options?.signal,
        body: JSON.stringify(request.agentInput),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${accessToken}`,
          'X-Coveo-Feature-Flags-Overrides': featureFlagOverridesHeaderValue,
        },
      });

      if (!isSuccessResponse(response)) {
        return {
          success: false,
          error: transformError(response),
        };
      }

      if (!response.body) {
        return {
          success: false,
          error: 'Unified endpoint request failed: empty stream response body.',
        };
      }

      return {
        success: true,
        data: {
          stream: response.body,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: transformError(error),
      };
    }
  };
};

export const createUnifiedEndpointClient = (): UnifiedEndpointClient => {
  return {
    call: createCallUnifiedEndpoint(),
  };
};

export interface UnifiedEndpointClientConfiguration {
  organizationId?: string;
  accessToken?: string;
  endpoint?: string;
}

export interface UnifiedEndpointCallOptions {
  signal?: AbortSignal;
}

export interface UnifiedEndpointResponse {
  stream: ReadableStream<Uint8Array>;
}

export type UnifiedEndpointClientResult =
  | {
      success: true;
      data: UnifiedEndpointResponse;
    }
  | {
      success: false;
      error: string;
    };

export interface UnifiedEndpointClient {
  call: (
    request: UnifiedEndpointRequest,
    configuration: UnifiedEndpointClientConfiguration,
    options?: UnifiedEndpointCallOptions
  ) => Promise<UnifiedEndpointClientResult>;
}
