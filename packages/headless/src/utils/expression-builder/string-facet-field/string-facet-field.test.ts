import {buildStringFacetField} from './string-facet-field';

describe('#buildStringFacetField', () => {
  describe('#toString', () => {
    it('#fuzzyMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'fuzzyMatch',
        value: 'hughes',
      });

      expect(builder.toString()).toBe('@author~= $quoteVar(value: hughes)');
    });

    it('#wildcardMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'wildcardMatch',
        value: '*hughes',
      });

      expect(builder.toString()).toBe('@author*=("*hughes")');
    });

    it('#phoneticMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'phoneticMatch',
        value: 'Omer',
      });

      expect(builder.toString()).toBe('@author%=("Omer")');
    });

    it('#differentThan operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'differentThan',
        value: 'ehughes',
      });

      expect(builder.toString()).toBe('@author<>("ehughes")');
    });
  });
});
