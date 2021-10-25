import {mapAttributesToProp} from './props-utils';

describe('mapAttributesToProp', () => {
  it('should map a simple attribute name (prefix-property) with a single value', () => {
    const map = {};
    mapAttributesToProp('provinces', map, [
      {name: 'provinces-canada', value: 'quebec'},
    ]);
    expect(map).toEqual({canada: ['quebec']});
  });

  it('should map a simple attribute name (prefix-property) with multiple values', () => {
    const map = {};
    mapAttributesToProp('provinces', map, [
      {name: 'provinces-canada', value: 'quebec, ontario'},
    ]);
    expect(map).toEqual({canada: ['quebec', 'ontario']});
  });

  it('should map a a prefix with multiple words in kebab case', () => {
    const map = {};
    mapAttributesToProp('topProvinces', map, [
      {name: 'top-provinces-canada', value: 'quebec'},
    ]);
    expect(map).toEqual({canada: ['quebec']});
  });

  it('should map a a property with multiple words in kebab case', () => {
    const map = {};
    mapAttributesToProp('cities', map, [
      {name: 'cities-british-columbia', value: 'vancouver'},
    ]);
    expect(map).toEqual({britishColumbia: ['vancouver']});
  });
});
