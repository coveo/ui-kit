import {describe, expect, it} from 'vitest';
import {convertChoicesToNumbers, validateInitialChoice} from './validate';

describe('validate', () => {
  describe('#convertChoicesToNumbers', () => {
    it('should convert a comma-separated string of choices to an array of numbers', () => {
      const choices = '10,20,30';
      const result = convertChoicesToNumbers(choices);
      expect(result).toEqual([10, 20, 30]);
    });

    it('should throw an error if a choice is not a number', () => {
      const choices = '10,foo,30';
      expect(() => convertChoicesToNumbers(choices)).toThrow(
        'The choice value "foo" from the "choicesDisplayed" option is not a number.'
      );
    });

    it('should throw an error if a choice is negative', () => {
      const choices = '10,-20,30';
      expect(() => convertChoicesToNumbers(choices)).toThrow(
        'The choice value "-20" from the "choicesDisplayed" option is not positive (<= 0).'
      );
    });

    it('should throw an error if a choice is zero', () => {
      const choices = '10,0,30';
      expect(() => convertChoicesToNumbers(choices)).toThrow(
        'The choice value "0" from the "choicesDisplayed" option is not positive (<= 0).'
      );
    });
  });

  describe('#validateInitialChoice', () => {
    it('should return the initial choice if it is in the choices array', () => {
      const initialChoice = 20;
      const choices = [10, 20, 30];
      const result = validateInitialChoice(initialChoice, choices);
      expect(result).toBe(initialChoice);
    });

    it('should throw an error if the initial choice is not in the choices array', () => {
      const initialChoice = 40;
      const choices = [10, 20, 30];
      expect(() => validateInitialChoice(initialChoice, choices)).toThrow(
        'The initial choice value "40" is not included in the choices 10,20,30.'
      );
    });
  });
});
