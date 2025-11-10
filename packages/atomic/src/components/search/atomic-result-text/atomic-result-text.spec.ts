import type {Result} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicResultText} from './atomic-result-text';
import './atomic-result-text';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-text', () => {
  let i18n: i18n;
  let mockResult: Result;

  const locators = {
    getText: (element: AtomicResultText) =>
      element?.querySelector('atomic-text'),
  };

  const assertTextContent = (text: Element | null, expectedContent: string) => {
    expect(text).toBeDefined();
    expect(text?.shadowRoot).toBeDefined();
    expect(text?.shadowRoot?.textContent).toBeDefined();
    expect(text?.shadowRoot?.textContent).toContain(expectedContent);
  };

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        'no-field-value': 'No value for field',
        'default-text': 'Default text content',
      },
      true
    );

    mockResult = buildFakeResult({
      title: 'Test Result Name',
      raw: {
        author: 'Test Author',
        custom_field: 'Custom Field Value',
        empty_field: '',
        null_field: null,
        urihash: '',
      },
    });
  });

  const renderComponent = async (
    options: {
      field?: string;
      shouldHighlight?: boolean;
      default?: string;
      result?: Result | null;
    } = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultText>({
        template: html`<atomic-result-text
          field=${ifDefined(options.field)}
          should-highlight=${ifDefined(options.shouldHighlight)}
          default=${ifDefined(options.default)}
        ></atomic-result-text>`,
        selector: 'atomic-result-text',
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
    const el = document.createElement('atomic-result-text');
    expect(el).toBeInstanceOf(AtomicResultText);
  });

  it('should set error when #field is empty', async () => {
    const element = await renderComponent({field: 'author'});

    expect(element.error).toBeUndefined();

    element.field = '';
    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(/field/i);
  });

  it('should set error when valid #field is updated to an empty value', async () => {
    const element = await renderComponent({field: 'author'});

    expect(element.error).toBeUndefined();

    element.field = '';
    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(/field/i);
  });

  it.each<{
    prop: 'shouldHighlight' | 'disableHighlight';
    invalidValue: string;
  }>([
    {
      prop: 'shouldHighlight',
      invalidValue: 'not-a-boolean',
    },
    {
      prop: 'disableHighlight',
      invalidValue: 'not-a-boolean',
    },
  ])(
    'should set error when #$prop is invalid',
    async ({prop, invalidValue}) => {
      const element = await renderComponent({field: 'author'});

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );

  it.each<{
    prop: 'shouldHighlight' | 'disableHighlight';
    validValue: boolean;
    invalidValue: string;
  }>([
    {
      prop: 'shouldHighlight',
      validValue: true,
      invalidValue: 'not-a-boolean',
    },
    {
      prop: 'disableHighlight',
      validValue: false,
      invalidValue: 'not-a-boolean',
    },
  ])(
    'should set error when valid #$prop is updated to an invalid value',
    async ({prop, validValue, invalidValue}) => {
      const element = await renderComponent({
        field: 'author',
        [prop]: validValue,
      });

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );

  it('should render nothing when default props are used', async () => {
    const element = await renderComponent();
    const text = locators.getText(element);
    expect(element).toBeDefined();
    expect(text).toBeNull();
    expect(element.textContent?.trim()).toBe('');
  });

  describe('when field has no value', () => {
    it.each([
      {field: 'empty_field', description: '#field is empty string'},
      {field: 'null_field', description: '#field is null'},
      {field: 'nonexistent_field', description: '#field does not exist'},
    ])('should render default value when $description', async ({field}) => {
      const element = await renderComponent({
        field,
        default: 'default-text',
      });

      const text = locators.getText(element);
      assertTextContent(text, 'Default text content');
    });

    it('should render nothing when no #default is provided', async () => {
      const element = await renderComponent({
        field: 'nonexistent_field',
        default: '',
      });

      const text = locators.getText(element);

      expect(text).toBeNull();
      expect(element).toBeDefined();
      expect(element.textContent?.trim()).toBe('');
    });
  });

  describe('when result is not available', () => {
    it.each([
      {result: null, description: '#result is null'},
      {result: undefined, description: '#result is undefined'},
    ])('should render error component when $description', async ({result}) => {
      const element = await renderComponent({
        result: result as unknown as Result,
      });

      const errorComponent = element?.querySelector('atomic-component-error');
      expect(errorComponent).toBeDefined();
    });
  });

  describe('when #shouldHighlight is true', () => {
    it.each([
      {
        field: 'title',
        value: 'Test Result Name',
        highlightKey: 'titleHighlights',
      },
      {
        field: 'excerpt',
        value: 'This is an excerpt with highlights',
        highlightKey: 'excerptHighlights',
      },
      {
        field: 'firstSentences',
        value: 'This is the first sentence.',
        highlightKey: 'firstSentencesHighlights',
      },
      {
        field: 'printableUri',
        value: 'https://example.com/test',
        highlightKey: 'printableUriHighlights',
      },
    ])(
      'should render highlights for #$field field with highlight keywords',
      async ({field, value, highlightKey}) => {
        const resultWithHighlights = buildFakeResult({
          [field === 'printableUri' ? 'printableUri' : field]: value,
          [highlightKey]: [
            {
              offset: 5,
              length: 6,
            },
          ],
        });

        const element = await renderComponent({
          field,
          shouldHighlight: true,
          result: resultWithHighlights,
        });

        const text = locators.getText(element);
        expect(text).toBeNull();
        expect(element.innerHTML).not.toContain('<atomic-text');
      }
    );

    it('should render highlights for #summary field with highlight keywords', async () => {
      const resultWithHighlights = buildFakeResult({
        raw: {
          summary: 'This is a summary of the result',
        },
        summaryHighlights: [
          {
            offset: 10,
            length: 7,
          },
        ],
      });

      const element = await renderComponent({
        field: 'summary',
        shouldHighlight: true,
        result: resultWithHighlights,
      });

      const text = locators.getText(element);
      expect(text).toBeNull();

      expect(element.innerHTML).not.toContain('<atomic-text');
    });

    it('should render plain text when #field is not supported for highlighting', async () => {
      const element = await renderComponent({
        field: 'author',
        shouldHighlight: true,
      });

      const text = locators.getText(element);
      assertTextContent(text, 'Test Author');
    });

    it.each([
      {
        description: 'no highlight keywords are available',
        highlights: [],
      },
      {
        description: 'highlight keywords are null',
        highlights: null as unknown as [],
      },
    ])('should render plain text when $description', async ({highlights}) => {
      const resultWithoutHighlights = buildFakeResult({
        title: 'Test Result Name',
        titleHighlights: highlights,
      });

      const element = await renderComponent({
        field: 'title',
        shouldHighlight: true,
        result: resultWithoutHighlights,
      });

      const text = locators.getText(element);
      assertTextContent(text, 'Test Result Name');
    });
  });

  describe('when #shouldHighlight is false', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it.each([
      {
        field: 'title',
        value: 'Test Result Name',
        highlightKey: 'titleHighlights',
      },
      {
        field: 'excerpt',
        value: 'This is an excerpt with highlights',
        highlightKey: 'excerptHighlights',
      },
    ])(
      'should render plain text for #$field field',
      async ({field, value, highlightKey}) => {
        const resultWithHighlights = buildFakeResult({
          [field]: value,
          [highlightKey]: [
            {
              offset: 5,
              length: 6,
            },
          ],
        });

        const element = await renderComponent({
          field,
          shouldHighlight: false,
          result: resultWithHighlights,
        });

        const text = locators.getText(element);
        assertTextContent(text, value);
      }
    );
  });
});
