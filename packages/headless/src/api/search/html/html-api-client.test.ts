import {buildContentURL} from './html-api-client.js';
import type {HtmlRequest} from './html-request.js';

describe('buildContentURL', () => {
  const baseRequest: HtmlRequest = {
    url: 'https://example.com',
    accessToken: 'test-token',
    organizationId: 'test-org',
    uniqueId: 'test-id',
    enableNavigation: false,
    requestedOutputSize: 42,
    q: 'some query',
  };

  it('should build the URL with required parameters', () => {
    const url = buildContentURL(baseRequest, '/html');
    expect(url).toBe(
      'https://example.com/html?access_token=test-token&organizationId=test-org&uniqueId=test-id&q=some%20query&enableNavigation=false&requestedOutputSize=42'
    );
  });

  it('should include the authentication parameter if provided', () => {
    const request = {...baseRequest, authentication: 'test-auth'};
    const url = buildContentURL(request, '/html');
    expect(url).toContain('authentication=test-auth');
  });

  it('should include the q parameter if provided', () => {
    const request = {...baseRequest, q: 'test-query'};
    const url = buildContentURL(request, '/html');
    expect(url).toContain('q=test-query');
  });

  it('should include the enableNavigation parameter if provided', () => {
    const request = {...baseRequest, enableNavigation: true};
    const url = buildContentURL(request, '/html');
    expect(url).toContain('enableNavigation=true');
  });

  it('should include the requestedOutputSize parameter if provided', () => {
    const request = {...baseRequest, requestedOutputSize: 100};
    const url = buildContentURL(request, '/html');
    expect(url).toContain('requestedOutputSize=100');
  });
});
