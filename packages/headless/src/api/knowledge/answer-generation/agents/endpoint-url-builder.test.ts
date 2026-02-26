import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {PlatformEnvironment} from '../../../../utils/url-utils.js';
import {getOrganizationEndpoint} from '../../../platform-client.js';
import {buildBaseAnswerGenerationUrl} from './endpoint-url-builder.js';

vi.mock('../../../platform-client.js', () => ({
  getOrganizationEndpoint: vi.fn(),
}));

const mockedGetOrganizationEndpoint = vi.mocked(getOrganizationEndpoint);

describe('buildBaseAnswerGenerationUrl', () => {
  const environment: PlatformEnvironment = 'prod';
  const organizationId = 'my-test-org';
  const agentId = 'agent-123';
  const expectedError = 'Missing required parameters for answer endpoint';

  beforeEach(() => {
    mockedGetOrganizationEndpoint.mockReturnValue(
      'https://my-test-org.org.coveo.com'
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('builds the preview agent URL using a trimmed agent ID', () => {
    const url = buildBaseAnswerGenerationUrl(
      `  ${agentId}  `,
      organizationId,
      environment
    );

    expect(url).toBe(
      `https://my-test-org.org.coveo.com/api/preview/organizations/${organizationId}/agents/${agentId}`
    );
    expect(mockedGetOrganizationEndpoint).toHaveBeenCalledWith(
      organizationId,
      environment
    );
  });

  it('throws when organization ID is missing', () => {
    expect(() =>
      buildBaseAnswerGenerationUrl('agent', '', environment)
    ).toThrow(expectedError);
  });

  it('throws when agent ID is blank after trimming', () => {
    expect(() =>
      buildBaseAnswerGenerationUrl('   ', organizationId, environment)
    ).toThrow(expectedError);
  });

  it('throws when the platform endpoint cannot be resolved', () => {
    mockedGetOrganizationEndpoint.mockReturnValue('');

    expect(() =>
      buildBaseAnswerGenerationUrl(agentId, organizationId, environment)
    ).toThrow(expectedError);
  });
});
