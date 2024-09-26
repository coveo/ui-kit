import {URLPath} from './url-utils.js';

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
});
