import {buildStringFacetField} from './string-facet-field';

describe('#buildStringFacetField', () => {
  describe('#toQuerySyntax', () => {
    it('#fuzzyMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'fuzzyMatch',
        value: 'hughes',
      });

      expect(builder.toQuerySyntax()).toBe(
        '@author~= $quoteVar(value: hughes)'
      );
    });

    it('#wildcardMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'wildcardMatch',
        value: '*hughes',
      });

      expect(builder.toQuerySyntax()).toBe('@author*=("*hughes")');
    });

    it('#phoneticMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'phoneticMatch',
        value: 'Omer',
      });

      expect(builder.toQuerySyntax()).toBe('@author%=("Omer")');
    });

    it('#differentThan operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'differentThan',
        value: 'ehughes',
      });

      expect(builder.toQuerySyntax()).toBe('@author<>("ehughes")');
    });

    it('#regexMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'regexMatch',
        value: 'ehughe[a-z]+',
      });

      expect(builder.toQuerySyntax()).toBe('@author/=("ehughe[a-z]+")');
    });

    it('with #negate set to true', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'wildcardMatch',
        value: '*hughes',
        negate: true,
      });

      expect(builder.toQuerySyntax()).toBe('NOT @author*=("*hughes")');
    });
  });
});
