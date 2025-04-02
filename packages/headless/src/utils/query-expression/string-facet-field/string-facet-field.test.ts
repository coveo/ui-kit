import {buildStringFacetField} from './string-facet-field.js';

describe('#buildStringFacetField', () => {
  describe('#toQuerySyntax', () => {
    it('#fuzzyMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'fuzzyMatch',
        value: 'someAuthor',
      });

      expect(builder.toQuerySyntax()).toBe(
        '@author~= $quoteVar(value: someAuthor)'
      );
    });

    it('#wildcardMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'wildcardMatch',
        value: '*someAuthor',
      });

      expect(builder.toQuerySyntax()).toBe('@author*=("*someAuthor")');
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
        value: 'someAuthor',
      });

      expect(builder.toQuerySyntax()).toBe('@author<>("someAuthor")');
    });

    it('#regexMatch operator', () => {
      const builder = buildStringFacetField({
        field: 'author',
        operator: 'regexMatch',
        value: 'someAuthor[a-z]+',
      });

      expect(builder.toQuerySyntax()).toBe('@author/=("someAuthor[a-z]+")');
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
