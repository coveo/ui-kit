import {createExpressionBuilder} from './expression-builder';

describe('createExpressionBuilder', () => {
  it('builder with no expression, #toString returns an empty string', () => {
    const builder = createExpressionBuilder({delimiter: 'and'});
    expect(builder.toString()).toBe('');
  });

  describe('#addStringField', () => {
    it(`#contains operator, one keyword value,
    #toString returns the expected syntax`, () => {
      const builder = createExpressionBuilder({
        delimiter: 'and',
      }).addStringField({
        field: 'author',
        operator: 'contains',
        values: ['al'],
      });

      expect(builder.toString()).toBe('@author="al"');
    });

    it(`#isExactly operator, one exactMatch value,
    #toString returns the expected syntax`, () => {
      const builder = createExpressionBuilder({
        delimiter: 'and',
      }).addStringField({
        field: 'author',
        operator: 'isExactly',
        values: ['alice'],
      });

      expect(builder.toString()).toBe('@author=="alice"');
    });

    it('#contains operator with multiple values', () => {
      const builder = createExpressionBuilder({
        delimiter: 'and',
      });

      builder.addStringField({
        field: 'author',
        operator: 'contains',
        values: ['al', 'alice'],
      });

      expect(builder.toString()).toBe('@author=("al","alice")');
    });
  });
});
