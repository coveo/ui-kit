import type {PlatformEnvironment} from '../../../../utils/url-utils.js';
import {getOrganizationEndpoint} from '../../../platform-client.js';

/**
 * Builds the base URL for answer generation requests based on the agent ID, organization ID, and environment.
 */
export const buildBaseAnswerGenerationUrl = (
  agentId: string,
  organizationId: string,
  environment: PlatformEnvironment
): string => {
  const platformEndpoint = getOrganizationEndpoint(organizationId, environment);

  const trimmedAgentId = agentId?.trim();
  if (!platformEndpoint || !organizationId || !trimmedAgentId) {
    throw new Error('Missing required parameters for answer endpoint');
  }
  return `http://localhost:3000/orgs/${organizationId}/agents/${trimmedAgentId}`;
  // const basePath = `/api/preview/organizations/${organizationId}/agents`;
  // return `${platformEndpoint}${basePath}/${trimmedAgentId}`;
};
