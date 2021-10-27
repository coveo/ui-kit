import {createExpressionBuilder, ExpressionBuilder} from './expression-builder';

describe('createExpressionBuilder', () => {
  let builder: ExpressionBuilder;

  beforeEach(() => {
    builder = createExpressionBuilder({delimiter: 'and'});
  });

  it('builder with no expression, #toString returns an empty string', () => {
    expect(builder.toString()).toBe('');
  });

  it('#addKeyword, #toString returns the expected syntax', () => {
    builder.addKeyword({
      expression: 'bbc news',
    });

    expect(builder.toString()).toBe('bbc news');
  });

  it('#addNear, #toString returns the expected syntax', () => {
    builder.addNear({
      startTerm: 'keep calm',
      otherTerms: [
        {
          endTerm: 'carry on',
          maxKeywordsBetween: 5,
        },
      ],
    });

    expect(builder.toString()).toBe('keep calm near:5 carry on');
  });

  it('#addExactMatch, #toString returns the expected syntax', () => {
    builder.addExactMatch({
      expression: 'bbc news',
    });

    expect(builder.toString()).toBe('"bbc news"');
  });

  it('#addFieldExists, #toString returns the expected syntax', () => {
    builder.addFieldExists({
      field: 'author',
    });

    expect(builder.toString()).toBe('@author');
  });

  it(`#addStringField, with one expression,
    #toString returns the expected syntax`, () => {
    builder.addStringField({
      field: 'author',
      operator: 'contains',
      values: ['al'],
    });

    expect(builder.toString()).toBe('@author="al"');
  });

  it('#addStringFacetField, with one expression, #toString returns the expected syntax', () => {
    builder.addStringFacetField({
      field: 'author',
      operator: 'differentThan',
      value: 'ehughes',
    });

    expect(builder.toString()).toBe('@author<>("ehughes")');
  });

  it('#addNumericField, with one expression, #toString returns the expected syntax', () => {
    builder.addNumericField({
      field: 'size',
      operator: 'greaterThan',
      value: 10,
    });

    expect(builder.toString()).toBe('@size>10');
  });

  it('#addNumericRangeField, with one expression, #toString returns the expected syntax', () => {
    builder.addNumericRangeField({
      field: 'size',
      from: 10,
      to: 20,
    });

    expect(builder.toString()).toBe('@size==10..20');
  });

  it('#addDateField, with one expression, #toString returns the expected syntax', () => {
    builder.addNumericField({
      field: 'size',
      operator: 'greaterThan',
      value: 10,
    });

    expect(builder.toString()).toBe('@size>10');
  });

  it('#addDateRangeField, with one expression, #toString returns the expected syntax', () => {
    builder.addNumericRangeField({
      field: 'size',
      from: 10,
      to: 20,
    });

    expect(builder.toString()).toBe('@size==10..20');
  });

  it('#addQueryExtension, #toString returns the expected syntax', () => {
    builder.addQueryExtension({
      name: 'q',
      parameters: [],
    });

    expect(builder.toString()).toBe('$q()');
  });
});
