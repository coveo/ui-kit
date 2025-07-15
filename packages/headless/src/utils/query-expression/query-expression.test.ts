import {
  buildQueryExpression,
  type QueryExpression,
} from './query-expression.js';

describe('buildQueryExpression', () => {
  let builder: QueryExpression;

  beforeEach(() => {
    builder = buildQueryExpression();
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
      value: 'someAuthor',
    });

    expect(builder.toQuerySyntax()).toBe('@author<>("someAuthor")');
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
    const builder = buildQueryExpression()
      .addStringField({
        field: 'author',
        operator: 'contains',
        values: ['someAuthor'],
      })
      .addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 100,
      })
      .joinUsing('and');

    expect(builder.toQuerySyntax()).toBe(
      '(@author="someAuthor") AND (@size>100)'
    );
  });

  it('#operator is #or, with two expressions, #toQuerySyntax joins them correctly', () => {
    const builder = buildQueryExpression()
      .addStringField({
        field: 'author',
        operator: 'contains',
        values: ['someAuthor'],
      })
      .addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 100,
      })
      .joinUsing('or');

    expect(builder.toQuerySyntax()).toBe(
      '(@author="someAuthor") OR (@size>100)'
    );
  });

  it('#addNumericRangeFieldwith one expression, #toString returns the expected syntax', () => {
    builder.addNumericRangeField({
      field: 'size',
      from: 10,
      to: 20,
    });

    expect(builder.toQuerySyntax()).toBe('@size==10..20');
  });

  it('#addDateField with one expression, #toString returns the expected syntax', () => {
    builder.addNumericField({
      field: 'size',
      operator: 'greaterThan',
      value: 10,
    });

    expect(builder.toQuerySyntax()).toBe('@size>10');
  });

  it('#addDateRangeField with one expression, #toString returns the expected syntax', () => {
    builder.addNumericRangeField({
      field: 'size',
      from: 10,
      to: 20,
    });

    expect(builder.toQuerySyntax()).toBe('@size==10..20');
  });

  it('concatenates multiple query expressions correctly', () => {
    const expression1 = buildQueryExpression().addKeyword({expression: 'a'});
    const expression2 = buildQueryExpression().addKeyword({expression: 'b'});

    builder.addExpression(expression1);
    builder.addExpression(expression2);
    builder.addKeyword({expression: 'c'});

    expect(builder.toQuerySyntax()).toBe('(a) AND (b) AND (c)');
  });
});
