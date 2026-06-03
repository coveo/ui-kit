import type {Result} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicResultLocalizedText} from './atomic-result-localized-text';
import './atomic-result-localized-text';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-localized-text', () => {
  let i18n: i18n;
  let mockResult: Result;

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        classic_book_advert: 'Classic book from {{name}}',
        book_count: 'You have {{count}} book',
        book_count_other: 'You have {{count}} books',
        multi_field_test: 'Author: {{author}}, Title: {{title}}',
        this_does_not_exist: 'this_does_not_exist',
      },
      true
    );

    mockResult = buildFakeResult({
      title: 'Test Book',
      raw: {
        author: 'Test Author',
        booktitle: 'Advanced Testing',
        bookcount: 1,
        multiplebookscount: 5,
      },
    });
  });

  const renderComponent = async (
    options: {
      localeKey?: string;
      fieldAuthor?: string;
      fieldBooktitle?: string;
      fieldCount?: string;
      result?: Result | null;
    } = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;

    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultLocalizedText>({
        template: html`<atomic-result-localized-text
          locale-key=${ifDefined(options.localeKey)}
          field-author=${ifDefined(options.fieldAuthor)}
          field-booktitle=${ifDefined(options.fieldBooktitle)}
          field-count=${ifDefined(options.fieldCount)}
        ></atomic-result-localized-text>`,
        selector: 'atomic-result-localized-text',
        result: resultToUse === null ? undefined : resultToUse,
        bindings: (bindings) => {
          bindings.i18n = i18n;
          bindings.store = {
            ...bindings.store,
            onChange: vi.fn(),
            state: {
              ...bindings.store?.state,
              loadingFlags: [],
            },
          };
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return element;
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-localized-text');
    expect(el).toBeInstanceOf(AtomicResultLocalizedText);
  });

  describe('when used outside a result template', () => {
    it('should render error component when result is not available', async () => {
      const element = await renderComponent({
        result: null,
        localeKey: 'classic_book_advert',
      });

      const errorComponent = element?.querySelector('atomic-component-error');
      expect(errorComponent).toBeDefined();
    });
  });

  describe('when the i18n resource does not exist', () => {
    it('should output the key directly', async () => {
      const element = await renderComponent({
        localeKey: 'this_does_not_exist',
      });

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toBe('this_does_not_exist');
    });
  });

  describe('when the i18n resource exists', () => {
    it('should render the localized text with field values', async () => {
      const element = await renderComponent({
        localeKey: 'classic_book_advert',
      });

      element.field = {author: 'name'};
      await element.updateComplete;

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toBe('Classic book from Test Author');
    });

    it('should render the localized text with multiple field values', async () => {
      const element = await renderComponent({
        localeKey: 'multi_field_test',
      });

      element.field = {author: 'author', booktitle: 'title'};
      await element.updateComplete;

      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toBe(
        'Author: Test Author, Title: Advanced Testing'
      );
    });

    describe('when field-count is provided', () => {
      it('should render singular form when count is 1', async () => {
        const element = await renderComponent({
          localeKey: 'book_count',
          fieldCount: 'bookcount',
        });

        expect(element).toBeDefined();
        expect(element.textContent?.trim()).toBe('You have 1 book');
      });

      it('should render plural form when count is greater than 1', async () => {
        const element = await renderComponent({
          localeKey: 'book_count',
          fieldCount: 'multiplebookscount',
        });

        expect(element).toBeDefined();
        expect(element.textContent?.trim()).toBe('You have 5 books');
      });

      it('should use count 1 as default when field does not exist', async () => {
        const element = await renderComponent({
          localeKey: 'book_count',
          fieldCount: 'nonexistent_field',
        });

        expect(element).toBeDefined();
        expect(element.textContent?.trim()).toBe('You have 1 book');
      });
    });

    describe('when field values are missing', () => {
      it('should render localized text without replacement when field does not exist', async () => {
        const element = await renderComponent({
          localeKey: 'classic_book_advert',
        });

        element.field = {nonexistent: 'name'};
        await element.updateComplete;

        expect(element).toBeDefined();
        expect(element.textContent?.trim()).toBe('Classic book from {{name}}');
      });
    });

    describe('when no field mappings are provided', () => {
      it('should render the localized text as-is', async () => {
        const element = await renderComponent({
          localeKey: 'classic_book_advert',
        });

        expect(element).toBeDefined();
        expect(element.textContent?.trim()).toBe('Classic book from {{name}}');
      });
    });
  });
});
