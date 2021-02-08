import {buildMockApiFunction} from '../mocks/mock-api-function';
import {buildMockApiInterface} from '../mocks/mock-api-interface';
import {buildMockEntryPoint} from '../mocks/mock-entry-point';
import {findApi} from './api-finder';

describe('#findApi', () => {
  it('retrieves an existing api by name', () => {
    const entryPoint = buildMockEntryPoint();

    const fn = buildMockApiFunction({name: 'buildPager'});
    entryPoint.addMember(fn);

    const result = findApi(entryPoint, 'buildPager');

    expect(result.displayName).toBe('buildPager');
  });

  it('when an api does not exist, it throws an error with the missing api name', () => {
    const entryPoint = buildMockEntryPoint();
    expect(() => findApi(entryPoint, 'buildPager')).toThrow(
      'No api found for buildPager'
    );
  });

  it('when an api name has a $1 suffix, it is able to retrieve the api', () => {
    const entryPoint = buildMockEntryPoint();
    const apiInterface = buildMockApiInterface({name: 'FacetOptions'});
    entryPoint.addMember(apiInterface);

    const result = findApi(entryPoint, 'FacetOptions$1');
    expect(result.displayName).toBe('FacetOptions');
  });
});
