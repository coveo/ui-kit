import {describe, expect, it} from 'vitest';
import locales from './locales.json';

const findInvalidTranslations = (keyPattern: RegExp, isValid: (value: string) => boolean) =>
  Object.entries(locales)
    .filter(([key]) => keyPattern.test(key))
    .flatMap(([key, translations]) =>
      Object.entries(translations)
        .filter(([, value]) => !isValid(value))
        .map(([language, value]) => `${key}/${language}: ${value}`)
    );

describe('locales', () => {
  // `atomic-result-date` passes the `calendar-*` translations to dayjs as format strings, where
  // any text outside `[]` is read as date tokens.
  describe('calendar translations', () => {
    it('should only contain weekday tokens and bracket-escaped text', () => {
      const dayjsFormat = /^(?:dddd?|\[[^\]]+\])(?:[\s,.'’-]+(?:dddd?|\[[^\]]+\]))*$/;

      expect(findInvalidTranslations(/^calendar-/, (value) => dayjsFormat.test(value))).toEqual([]);
    });

    it('should render the weekday for the dates within a week', () => {
      const hasWeekday = (value: string) => value.replace(/\[[^\]]+\]/g, '').includes('ddd');

      expect(findInvalidTranslations(/^calendar-(next|last)-week$/, hasWeekday)).toEqual([]);
    });
  });
});
