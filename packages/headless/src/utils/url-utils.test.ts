import {matchCoveoOrganizationEndpointUrl, URLPath} from './url-utils';

describe('URLPath', () => {
  const testBasePath = 'https://www.test.com';
  describe('without params', () => {
    it('should return base url', () => {
      const url = new URLPath(testBasePath);

      expect(url.href).toBe(testBasePath);
    });
  });

  describe('with params', () => {
    const testParams = [
      {
        key: 'testKey',
        value: 'test#Value',
      },
      {
        key: 'testKey1',
        value: 'test#Value1',
      },
    ];

    it('should return full url', () => {
      const url = new URLPath(testBasePath);
      const param = testParams[0];

      url.addParam(param.key, param.value);

      expect(url.href).toBe('https://www.test.com?testKey=test%23Value');
    });

    it('should return full url with concatenated params', () => {
      const url = new URLPath(testBasePath);

      testParams.forEach((param) => url.addParam(param.key, param.value));

      expect(url.href).toBe(
        'https://www.test.com?testKey=test%23Value&testKey1=test%23Value1'
      );
    });
  });

  describe('isCoveoOrganizationEndpointUrl', () => {
    it.each([
      {url: 'https://myorg.org.coveo.com', env: undefined},
      {url: 'https://myorg.orghipaa.coveo.com', env: 'hipaa'},
      {url: 'https://myorg.orgstg.coveo.com', env: 'stg'},
      {url: 'https://myorg.orgdev.coveo.com', env: 'dev'},
    ])('should correctly identify organization endpoints', ({url, env}) => {
      const match = matchCoveoOrganizationEndpointUrl(url, 'myorg');
      expect(match).toBeTruthy();
      expect(match?.environment).toBe(env);
    });
  });

  it.each([
    'https://platform.cloud.coveo.com',
    'https://platform-eu.cloud.coveo.com',
    'https://platformhipaa.cloud.coveo.com',
    'https://analytics.cloud.coveo.com',
    'https://search.cloud.coveo.com',
    'https://completely.random.com',
  ])('should correctly identify non-organization endpoints', (url) => {
    expect(matchCoveoOrganizationEndpointUrl(url, 'myorg')).toBeFalsy();
  });
});
