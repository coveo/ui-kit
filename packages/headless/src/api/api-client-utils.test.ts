import {pickNonBaseParams} from './api-client-utils';
import {BaseParam} from './platform-service-params';
import {AuthenticationParam} from './search/search-api-params';

interface TestParam {
  a?: string;
  b?: number;
  c?: boolean;
  d?: TestParam;
  e?: TestParam[];
}

describe('api-client-utils', () => {
  describe('#pickNonBaseParams', () => {
    let params: BaseParam & AuthenticationParam & TestParam;
    beforeEach(() => {
      params = {
        url: 'url',
        accessToken: 'accessToken',
        organizationId: 'organizationId',
        authentication: 'authentication',
        a: 'a',
        b: 1,
        c: false,
        d: {a: 'a', b: 1, c: false},
        e: [{a: 'a', b: 1, c: false}],
      };
    });
    it('should return all defined properties', () => {
      expect(pickNonBaseParams(params)).toEqual({
        a: 'a',
        b: 1,
        c: false,
        d: {a: 'a', b: 1, c: false},
        e: [{a: 'a', b: 1, c: false}],
      });
    });
    it('should not return undefined top-level properties', () => {
      params.a = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        b: 1,
        c: false,
        d: {a: 'a', b: 1, c: false},
        e: [{a: 'a', b: 1, c: false}],
      });
      params.b = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        c: false,
        d: {a: 'a', b: 1, c: false},
        e: [{a: 'a', b: 1, c: false}],
      });
      params.c = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        d: {a: 'a', b: 1, c: false},
        e: [{a: 'a', b: 1, c: false}],
      });
      params.d = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        e: [{a: 'a', b: 1, c: false}],
      });
      params.e = undefined;
      expect(pickNonBaseParams(params)).toEqual({});
    });
    it('should not return undefined nested properties', () => {
      params.d!.a = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        a: 'a',
        b: 1,
        c: false,
        d: {b: 1, c: false},
        e: [{a: 'a', b: 1, c: false}],
      });
      params.d!.b = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        a: 'a',
        b: 1,
        c: false,
        d: {c: false},
        e: [{a: 'a', b: 1, c: false}],
      });
      params.d!.c = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        a: 'a',
        b: 1,
        c: false,
        d: {},
        e: [{a: 'a', b: 1, c: false}],
      });
    });
    it('should not return any undefined array object nested properties', () => {
      params.e![0].a = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        a: 'a',
        b: 1,
        c: false,
        d: {a: 'a', b: 1, c: false},
        e: [{b: 1, c: false}],
      });
      params.e![0].b = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        a: 'a',
        b: 1,
        c: false,
        d: {a: 'a', b: 1, c: false},
        e: [{c: false}],
      });
      params.e![0].c = undefined;
      expect(pickNonBaseParams(params)).toEqual({
        a: 'a',
        b: 1,
        c: false,
        d: {a: 'a', b: 1, c: false},
        e: [{}],
      });
    });
  });
});
