import {createExpressionBuilder, ExpressionBuilder} from './expression-builder';

describe('createExpressionBuilder', () => {
  let builder: ExpressionBuilder;

  beforeEach(() => {
    builder = createExpressionBuilder({delimiter: 'and'});
  });

  it('builder with no expression, #toString returns an empty string', () => {
    expect(builder.toString()).toBe('');
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
});
