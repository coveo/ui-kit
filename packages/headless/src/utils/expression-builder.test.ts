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
    it(`#contains operator, one value,
    #toString returns the expected syntax`, () => {
      builder.addStringField({
        field: 'author',
        operator: 'contains',
        values: ['al'],
      });

      expect(builder.toString()).toBe('@author="al"');
    });

    it(`#isExactly operator, one value,
    #toString returns the expected syntax`, () => {
      builder.addStringField({
        field: 'author',
        operator: 'isExactly',
        values: ['alice'],
      });

      expect(builder.toString()).toBe('@author=="alice"');
    });

    it('#contains operator with multiple values', () => {
      builder.addStringField({
        field: 'author',
        operator: 'contains',
        values: ['al', 'alice'],
      });

      expect(builder.toString()).toBe('@author=("al","alice")');
    });
  });

  describe('#addNumericField', () => {
    it('#greaterThan operator, #toString returns the expected syntax', () => {
      builder.addNumericField({
        field: 'size',
        operator: 'greaterThan',
        value: 10,
      });

      expect(builder.toString()).toBe('@size>10');
    });

    it('#greaterThanOrEqual operator, #toString returns the expected syntax', () => {
      builder.addNumericField({
        field: 'size',
        operator: 'greaterThanOrEqual',
        value: 10,
      });

      expect(builder.toString()).toBe('@size>=10');
    });

    it('#lowerThan operator, #toString returns the expected syntax', () => {
      builder.addNumericField({
        field: 'size',
        operator: 'lowerThan',
        value: 10,
      });

      expect(builder.toString()).toBe('@size<10');
    });

    it('#lowerThanOrEqual operator, #toString returns the expected syntax', () => {
      builder.addNumericField({
        field: 'size',
        operator: 'lowerThanOrEqual',
        value: 10,
      });

      expect(builder.toString()).toBe('@size<=10');
    });
  });
});
