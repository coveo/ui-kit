import type {ConverseRequestModel} from './unified-endpoint-types.js';
import {
  isSuccessResponse,
  readActionInFlightConflict,
  readTransientFailure,
  transformError,
  type ActionInFlightConflict,
  type TransientFailure,
} from '@/src/internal/api/protocol/error-handling.js';
import {getOrganizationEndpoint} from '@/src/internal/api/organization-endpoint.js';

const ACTION_IN_FLIGHT_ERROR =
  'Conflict: Another request is still being processed for this session.';

const createCallUnifiedEndpoint = (): UnifiedEndpointClient['call'] => {
  return async (
    agentInput: ConverseRequestModel,
    configuration: UnifiedEndpointClientConfiguration,
    options?: UnifiedEndpointCallOptions
  ): Promise<UnifiedEndpointClientResult> => {
    try {
      const {organizationId, accessToken, endpoint} = configuration;

      if (!accessToken) {
        return {
          success: false,
          unsent: true,
          error:
            'Configuration error: Access token is not set. Please configure your access token.',
        };
      }

      // When `endpoint` is provided it is the exact URL to POST to (append
      // nothing). When absent, derive the org host and append the fixed
      // converse path — which requires a non-empty org id.
      let url: string;
      if (endpoint) {
        url = endpoint;
      } else {
        if (!organizationId) {
          return {
            success: false,
            unsent: true,
            error:
              'Configuration error: Organization ID is not set. Please configure your organization ID.',
          };
        }

        const organizationEndpoint = getOrganizationEndpoint(organizationId);
        url =
          organizationEndpoint +
          '/api/preview/organizations/' +
          organizationId +
          '/agents/commerce/agui/converse';
      }

      const init: RequestInit = {
        method: 'POST',
        signal: options?.signal,
        body: JSON.stringify(agentInput),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${accessToken}`,
        },
      };
      let response: Response;
      try {
        response = await fetch(url, init);
      } catch (error) {
        // What `fetch` throws, short of an abort, means the request never got an answer.
        if (isAbortError(error)) {
          return {success: false, error: transformError(error)};
        }
        return {success: false, error: transformError(error), transient: {}};
      }

      if (!isSuccessResponse(response)) {
        const conflict = await readActionInFlightConflict(response);
        if (conflict) {
          return {success: false, error: ACTION_IN_FLIGHT_ERROR, conflict, status: response.status};
        }
        const transient = readTransientFailure(response);
        return transient
          ? {success: false, error: transformError(response), status: response.status, transient}
          : {success: false, error: transformError(response), status: response.status};
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
      return {success: false, error: transformError(error)};
    }
  };
};

function isAbortError(error: unknown): boolean {
  return (error instanceof Error || error instanceof DOMException) && error.name === 'AbortError';
}

export const createUnifiedEndpointClient = (): UnifiedEndpointClient => {
  return {
    call: createCallUnifiedEndpoint(),
  };
};

interface UnifiedEndpointClientConfiguration {
  organizationId?: string;
  accessToken?: string;
  endpoint?: string;
}

interface UnifiedEndpointCallOptions {
  signal?: AbortSignal;
}

interface UnifiedEndpointResponse {
  stream: ReadableStream<Uint8Array>;
}

type UnifiedEndpointClientResult =
  | {
      success: true;
      data: UnifiedEndpointResponse;
    }
  | {
      success: false;
      error: string;
      conflict?: ActionInFlightConflict;
      /** The HTTP status, when the endpoint answered with an error. */
      status?: number;
      /** Set when the request was never sent, such as for a configuration error. */
      unsent?: true;
      /** Set for a network error, a `429`, `502`, `503` or `504`. */
      transient?: TransientFailure;
    };

export interface UnifiedEndpointClient {
  call: (
    agentInput: ConverseRequestModel,
    configuration: UnifiedEndpointClientConfiguration,
    options?: UnifiedEndpointCallOptions
  ) => Promise<UnifiedEndpointClientResult>;
}
