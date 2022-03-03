import {attributesToStringMap, stringMapToStringArrayMap} from './props-utils';

describe('attributesToStringMap', () => {
  describe('with stringMapToStringArrayMap', () => {
    it('should map a simple attribute name (prefix-property) with a single value', () => {
      const map = stringMapToStringArrayMap(
        attributesToStringMap('provinces', [
          {name: 'provinces-canada', value: 'quebec'},
        ])
      );
      expect(map).toEqual({canada: ['quebec']});
    });

    it('should map a simple attribute name (prefix-property) with multiple values', () => {
      const map = stringMapToStringArrayMap(
        attributesToStringMap('provinces', [
          {name: 'provinces-canada', value: 'quebec, ontario'},
        ])
      );
      expect(map).toEqual({canada: ['quebec', 'ontario']});
    });

    it('should map a a prefix with multiple words in kebab case', () => {
      const map = stringMapToStringArrayMap(
        attributesToStringMap('topProvinces', [
          {name: 'top-provinces-canada', value: 'quebec'},
        ])
      );
      expect(map).toEqual({canada: ['quebec']});
    });

    it('should map a a property with multiple words in kebab case', () => {
      const map = stringMapToStringArrayMap(
        attributesToStringMap('cities', [
          {name: 'cities-british-columbia', value: 'vancouver'},
        ])
      );
      expect(map).toEqual({britishColumbia: ['vancouver']});
    });
  });
});
