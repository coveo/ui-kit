import {I18nService} from "c/quanticUtils";

describe('c/quanticUtils', () => {
  describe('I18nService', () => {
    it('getTextWithDecorator should return text wrapped in given tags', () => {
      const text = 'sample text';
      const startTag = '<test-start-tag>';
      const endTag = '<test-end-tag>';
      expect(I18nService.getTextWithDecorator(text, startTag, endTag)).toBe(`${startTag}${text}${endTag}`);
    })

    it('getTextBold should return text wrapped in bold tags', () => {
      const text = 'sample text';
      expect(I18nService.getTextBold(text)).toBe(`<b>${text}</b>`);
    })

    describe('getLabelNameWithCount', () => {
      const testLabelName = 'thisLabelName';
      const testLabelNamePlural = `${testLabelName}_plural`;
      
      it('should return plural variant if count not equal to 1', () => {
        expect(I18nService.getLabelNameWithCount(testLabelName, 99)).toBe(testLabelNamePlural);
      });

      it('should return plural variant if count is fraction of 1', () => {
        expect(I18nService.getLabelNameWithCount(testLabelName, 0.5)).toBe(testLabelNamePlural);
      });

      it('should return plural variant if count is 0', () => {
        expect(I18nService.getLabelNameWithCount(testLabelName, 0)).toBe(testLabelNamePlural);
      });

      it('should return singular variant if count is equal to 1', () => {
        expect(I18nService.getLabelNameWithCount(testLabelName, 1)).toBe(testLabelName);
      });

      it('should return singular variant if count is equal to -1', () => {
        expect(I18nService.getLabelNameWithCount(testLabelName, -1)).toBe(testLabelName);
      });
    });

    describe('format', () => {
      it('should throw an error if the given string is not a string', () => {
        let caughtError;
        try {
          I18nService.format(undefined);
        } catch (error) {
          caughtError = error;
        }
        expect(caughtError).toBeDefined();
      });

      it('should return the given string if no formatting arguments are given', () => {
        const testString = 'this is a test string';
        expect(I18nService.format(testString)).toBe(testString);
      });

      it('should return the given string with formatting arguments inserted in order', () => {
        const testString = 'this is a {{0}} string, {{1}}.';
        const test = 'test';
        const buddy = 'buddy';
        expect(I18nService.format(testString, test, buddy)).toBe('this is a test string, buddy.');
      });
    });
  })
});