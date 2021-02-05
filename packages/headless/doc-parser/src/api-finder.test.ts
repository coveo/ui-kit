import {buildMockApiFunction} from '../mocks/mock-api-function';
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
});
