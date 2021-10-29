import {buildQueryExpression, QueryExpression} from './query-expression';

describe('buildQueryExpression', () => {
  let builder: QueryExpression;

  beforeEach(() => {
    builder = buildQueryExpression({operator: 'and'});
  });

  it('builder with no expression, #toQuerySyntax returns an empty string', () => {
    expect(builder.toQuerySyntax()).toBe('');
  });

  it('#addKeyword, #toQuerySyntax returns the expected syntax', () => {
    builder.addKeyword({
      expression: 'bbc news',
    });

    expect(builder.toQuerySyntax()).toBe('bbc news');
  });

  it('#addNear, #toQuerySyntax returns the expected syntax', () => {
    builder.addNear({
      startTerm: 'keep calm',
      otherTerms: [
        {
          endTerm: 'carry on',
          maxKeywordsBetween: 5,
        },
      ],
    });

    expect(builder.toQuerySyntax()).toBe('keep calm near:5 carry on');
  });

  it('#addExactMatch, #toQuerySyntax returns the expected syntax', () => {
    builder.addExactMatch({
      expression: 'bbc news',
    });

    expect(builder.toQuerySyntax()).toBe('"bbc news"');
  });

  it('#addFieldExists, #toQuerySyntax returns the expected syntax', () => {
    builder.addFieldExists({
      field: 'author',
    });

    expect(builder.toQuerySyntax()).toBe('@author');
  });

  it(`#addStringField, with one expression,
    #toQuerySyntax returns the expected syntax`, () => {
    builder.addStringField({
      field: 'author',
      operator: 'contains',
      values: ['al'],
    });

    expect(builder.toQuerySyntax()).toBe('@author="al"');
  });

  it('#addStringFacetField, with one expression, #toQuerySyntax returns the expected syntax', () => {
    builder.addStringFacetField({
      field: 'author',
      operator: 'differentThan',
      value: 'ehughes',
    });

    expect(builder.toQuerySyntax()).toBe('@author<>("ehughes")');
  });

  it('#addNumericField, with one expression, #toQuerySyntax returns the expected syntax', () => {
    builder.addNumericField({
      field: 'size',
      operator: 'greaterThan',
      value: 10,
    });

    expect(builder.toQuerySyntax()).toBe('@size>10');
  });

  it('#addNumericRangeField, with one expression, #toQuerySyntax returns the expected syntax', () => {
    builder.addNumericRangeField({
      field: 'size',
      from: 10,
      to: 20,
    });

    expect(builder.toQuerySyntax()).toBe('@size==10..20');
  });

  it('#addDateField, with one expression, #toQuerySyntax returns the expected syntax', () => {
    builder.addNumericField({
      field: 'size',
      operator: 'greaterThan',
      value: 10,
    });

    expect(builder.toQuerySyntax()).toBe('@size>10');
  });

  it('#addDateRangeField, with one expression, #toQuerySyntax returns the expected syntax', () => {
    builder.addNumericRangeField({
      field: 'size',
      from: 10,
      to: 20,
    });

    expect(builder.toQuerySyntax()).toBe('@size==10..20');
  });

  it('#addQueryExtension, #toQuerySyntax returns the expected syntax', () => {
    builder.addQueryExtension({
      name: 'q',
      parameters: {},
    });

    expect(builder.toQuerySyntax()).toBe('$q()');
  });

  it('#operator is #and, with two expressions, #toQuerySyntax joins them correctly', () => {
    const builder = buildQueryExpression({operator: 'and'})
      .addStringField({
        field: 'author',
        operator: 'contains',
        values: ['ehughes'],
      })
      .addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 100,
      });

    expect(builder.toQuerySyntax()).toBe('(@author="ehughes") AND (@size>100)');
  });

  it('#operator is #or, with two expressions, #toQuerySyntax joins them correctly', () => {
    const builder = buildQueryExpression({operator: 'or'})
      .addStringField({
        field: 'author',
        operator: 'contains',
        values: ['ehughes'],
      })
      .addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 100,
      });

    expect(builder.toQuerySyntax()).toBe('(@author="ehughes") OR (@size>100)');
  });

  describe('#addNumericRangeField', () => {
    it('with one expression, #toQuerySyntax returns the expected syntax', () => {
      builder.addNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
      });

      expect(builder.toQuerySyntax()).toBe('@size==10..20');
    });
  });

  describe('#addDateField', () => {
    it('with one expression, #toQuerySyntax returns the expected syntax', () => {
      builder.addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 10,
      });

      expect(builder.toQuerySyntax()).toBe('@size>10');
    });
  });

  describe('#addDateRangeField', () => {
    it('with one expression, #toQuerySyntax returns the expected syntax', () => {
      builder.addNumericRangeField({
        field: 'size',
        from: 10,
        to: 20,
      });

      expect(builder.toQuerySyntax()).toBe('@size==10..20');
    });
  });
});
