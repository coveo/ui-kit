import {
  I18nUtils,
  buildTemplateTextFromResult,
  copyToClipboard,
  TimeSpan,
} from 'c/quanticUtils';

describe('c/quanticUtils', () => {
  describe('I18nUtils', () => {
    it('getTextWithDecorator should return text wrapped in given tags', () => {
      const text = 'sample text';
      const startTag = '<test-start-tag>';
      const endTag = '<test-end-tag>';
      expect(I18nUtils.getTextWithDecorator(text, startTag, endTag)).toBe(
        `${startTag}${text}${endTag}`
      );
    });

    it('getTextBold should return text wrapped in bold tags', () => {
      const text = 'sample text';
      expect(I18nUtils.getTextBold(text)).toBe(`<b>${text}</b>`);
    });

    describe('getLabelNameWithCount', () => {
      const testLabelName = 'thisLabelName';
      const testLabelNamePlural = `${testLabelName}_plural`;
      const testLabelNameZero = `${testLabelName}_zero`;

      it('should return plural variant if count not equal to 1', () => {
        expect(I18nUtils.getLabelNameWithCount(testLabelName, 99)).toBe(
          testLabelNamePlural
        );
      });

      it('should return plural variant if count is fraction of 1', () => {
        expect(I18nUtils.getLabelNameWithCount(testLabelName, 0.5)).toBe(
          testLabelNamePlural
        );
      });

      it('should return zero variant if count is 0', () => {
        expect(I18nUtils.getLabelNameWithCount(testLabelName, 0)).toBe(
          testLabelNameZero
        );
      });

      it('should return singular variant if count is equal to 1', () => {
        expect(I18nUtils.getLabelNameWithCount(testLabelName, 1)).toBe(
          testLabelName
        );
      });

      it('should return singular variant if count is equal to -1', () => {
        expect(I18nUtils.getLabelNameWithCount(testLabelName, -1)).toBe(
          testLabelName
        );
      });

      describe('given other locale', () => {
        jest.resetModules();
        jest.mock('@salesforce/i18n/locale', () => ({
          default: 'de-DE',
        }));
        const withOtherLocale = require('c/quanticUtils');

        it('should return label name without failing', () => {
          expect(() =>
            withOtherLocale.I18nUtils.getLabelNameWithCount(testLabelName, 2)
          ).not.toThrow();
        });
      });
    });

    describe('format', () => {
      it('should throw an error if the given string is not a string', () => {
        let caughtError;
        try {
          I18nUtils.format(undefined);
        } catch (error) {
          caughtError = error;
        }
        expect(caughtError).toBeDefined();
      });

      it('should return the given string if no formatting arguments are given', () => {
        const testString = 'this is a test string';
        expect(I18nUtils.format(testString)).toBe(testString);
      });

      it('should return the given string with formatting arguments inserted in order', () => {
        const testString = 'this is a {{0}} string, {{1}}.';
        const test = 'test';
        const buddy = 'buddy';
        expect(I18nUtils.format(testString, test, buddy)).toBe(
          'this is a test string, buddy.'
        );
      });
    });

    describe('escapeHTML', () => {
      it('should escape html tags', () => {
        let htmlWithTags = '<div>test string</div>';

        expect(I18nUtils.escapeHTML(htmlWithTags)).toBe(
          '&lt;div&gt;test string&lt;/div&gt;'
        );
      });

      it('should escape html anchor tags', () => {
        let htmlWithTags = '<a src="http://www.sketchysite.com"></a>';

        expect(I18nUtils.escapeHTML(htmlWithTags)).toBe(
          '&lt;a src="http://www.sketchysite.com"&gt;&lt;/a&gt;'
        );
      });
    });
  });

  describe('copy to clipboard', () => {
    const mockExecCommand = jest.fn(() => {});
    const mockWriteText = jest.fn(() => new Promise(() => {}));

    beforeAll(() => {
      Object.defineProperty(document, 'execCommand', {
        value: mockExecCommand,
        writable: true,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('when the Clipboard API is available', () => {
      it('should correctly perform the copy to clipboard operation using the writeText method', () => {
        const exampleText = 'example text';

        Object.defineProperty(navigator, 'clipboard', {
          value: {
            ...navigator.clipboard,
            writeText: mockWriteText,
          },
          writable: true,
        });

        copyToClipboard(exampleText);
        expect(mockWriteText).toHaveBeenCalledTimes(1);
        expect(mockWriteText.mock.calls[0][0]).toBe(exampleText);
        expect(mockExecCommand).toHaveBeenCalledTimes(0);
      });
    });

    describe('when the Clipboard API is not available', () => {
      it('should correctly perform the copy to clipboard operation using the DOM method', () => {
        const exampleText = 'example text';

        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          writable: true,
        });

        copyToClipboard(exampleText);
        expect(mockWriteText).toHaveBeenCalledTimes(0);
        expect(mockExecCommand).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('buildTemplateTextFromResult', () => {
    const testTemplate =
      '<a href="${clickUri}">${title}</a><br/><br/><quote>${excerpt}</quote>';
    const testResult = {
      clickUri: 'https://www.example.com',
      title: 'Example Title',
      excerpt: 'This is an example excerpt.',
    };

    it('should return a string with the result values inserted into the template', () => {
      // @ts-ignore
      expect(buildTemplateTextFromResult(testTemplate, testResult)).toBe(
        `<a href="${testResult.clickUri}">${testResult.title}</a><br/><br/><quote>${testResult.excerpt}</quote>`
      );
    });

    it('should return an empty string if the template is undefined or falsy', () => {
      // @ts-ignore
      expect(buildTemplateTextFromResult(undefined, testResult)).toBe('');
    });

    it('should not return the template field name as placeholder if the result does not contain the field', () => {
      const resultWithoutExcerpt = {
        clickUri: 'https://www.example.com',
        title: 'Example Title',
      };

      // @ts-ignore
      expect(
        buildTemplateTextFromResult(testTemplate, resultWithoutExcerpt)
      ).toBe(
        `<a href="${testResult.clickUri}">${testResult.title}</a><br/><br/><quote></quote>`
      );
    });
  });

  describe('TimeSpan', () => {
    describe('getYoutubeFormatTimestamp', () => {
      it('should return the correct YouTube timestamp format for timestamps of less than a minute', () => {
        const timeSpan = new TimeSpan(45000); // 45 seconds
        expect(timeSpan.getYoutubeFormatTimestamp()).toBe('0:45');
      });

      it('should return the correct YouTube timestamp format for timestamps of more than an hour', () => {
        const timeSpan = new TimeSpan(3661000); // 1 hour, 1 minute, and 1 second
        expect(timeSpan.getYoutubeFormatTimestamp()).toBe('1:01:01');
      });

      it('should return the correct YouTube timestamp format for timestamps of less than an hour', () => {
        const timeSpan = new TimeSpan(300000); // 5 minutes
        expect(timeSpan.getYoutubeFormatTimestamp()).toBe('05:00');
      });
    });
  });
});
