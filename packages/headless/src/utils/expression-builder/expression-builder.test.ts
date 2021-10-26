import {createExpressionBuilder, ExpressionBuilder} from './expression-builder';

describe('createExpressionBuilder', () => {
  let builder: ExpressionBuilder;

  beforeEach(() => {
    builder = createExpressionBuilder({delimiter: 'and'});
  });

  it('builder with no expression, #toString returns an empty string', () => {
    expect(builder.toString()).toBe('');
  });

  describe('#addKeywordExpression', () => {
    it('#toString returns the expected syntax', () => {
      builder.addKeywordExpression({
        expression: 'bbc news',
      });

      expect(builder.toString()).toBe('bbc news');
    });
  });

  describe('#addExactMatchExpression', () => {
    it('#toString returns the expected syntax', () => {
      builder.addExactMatchExpression({
        expression: 'bbc news',
      });

      expect(builder.toString()).toBe('"bbc news"');
    });
  });

  describe('#addStringField', () => {
    it(`with one expression,
    #toString returns the expected syntax`, () => {
      builder.addStringField({
        field: 'author',
        operator: 'contains',
        values: ['al'],
      });

      expect(builder.toString()).toBe('@author="al"');
    });
  });

  describe('#addStringFacetField', () => {
    it('with one expression, #toString returns the expected syntax', () => {
      builder.addStringFacetField({
        field: 'author',
        operator: 'differentThan',
        value: 'ehughes',
      });

      expect(builder.toString()).toBe('@author<>("ehughes")');
    });
  });

  describe('#addNumericField', () => {
    it('with one expression, #toString returns the expected syntax', () => {
      builder.addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 10,
      });

      expect(builder.toString()).toBe('@size>10');
    });
  });

  describe('#addNumericRangeField', () => {
    it('with one expression, #toString returns the expected syntax', () => {
      builder.addNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
      });

      expect(builder.toString()).toBe('@size==10..20');
    });
  });

  describe('#addDateField', () => {
    it('with one expression, #toString returns the expected syntax', () => {
      builder.addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 10,
      });

      expect(builder.toString()).toBe('@size>10');
    });
  });

  describe('#addDateRangeField', () => {
    it('with one expression, #toString returns the expected syntax', () => {
      builder.addNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
      });

      expect(builder.toString()).toBe('@size==10..20');
    });
  });
});
