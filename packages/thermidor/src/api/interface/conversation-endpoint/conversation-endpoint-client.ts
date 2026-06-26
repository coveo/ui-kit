import type {
  CoveoConversationEndpointRequest,
  CoveoConversationEndpointResponse,
} from './conversation-endpoint-types.js';
import {
  isSuccessResponse,
  transformError,
} from '@/src/api/internal/protocol/error-handling.js';
import {getOrganizationEndpoint} from '@/src/api/internal/utils/organization-endpoint.js';

const featureFlagOverridesHeaderValue = JSON.stringify({
  'use-demo-agent-core-runtime': false,
});

const createCallConversationEndpoint =
  (): ConversationEndpointClient['call'] => {
    return async (
      request: CoveoConversationEndpointRequest,
      configuration: ConversationEndpointClientConfiguration,
      options?: ConversationEndpointCallOptions
    ): Promise<ConversationEndpointClientResult> => {
      try {
        const {organizationId, accessToken, endpoint, a2uiVersion} =
          configuration;

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
        let url =
          `${organizationEndpoint}` +
          '/rest/organizations/' +
          `${organizationId}` +
          '/commerce/unstable/agentic/converse';

        if (a2uiVersion) {
          url += `?a2uiVersion=${a2uiVersion}`;
        }

        const response = await fetch(url, {
          method: 'POST',
          signal: options?.signal,
          body: JSON.stringify(request),
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
            error: 'Conversation request failed: empty stream response body.',
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

export const createConversationEndpointClient =
  (): ConversationEndpointClient => {
    return {
      call: createCallConversationEndpoint(),
    };
  };

export interface ConversationEndpointClientConfiguration {
  organizationId?: string;
  accessToken?: string;
  endpoint?: string;
  a2uiVersion?: '0.8' | '0.9';
}

export interface ConversationEndpointCallOptions {
  signal?: AbortSignal;
}

export type ConversationEndpointClientResult =
  | {
      success: true;
      data: CoveoConversationEndpointResponse;
    }
  | {
      success: false;
      error: string;
    };

export interface ConversationEndpointClient {
  call: (
    request: CoveoConversationEndpointRequest,
    configuration: ConversationEndpointClientConfiguration,
    options?: ConversationEndpointCallOptions
  ) => Promise<ConversationEndpointClientResult>;
}
