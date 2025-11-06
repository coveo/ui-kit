import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement, type TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {AtomicResultNumber} from './atomic-result-number';
import './atomic-result-number';
import type {i18n} from 'i18next';
import {customElement} from 'lit/decorators.js';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';

vi.mock('@coveo/headless', async () => {
  const actual =
    await vi.importActual<typeof import('@coveo/headless')>('@coveo/headless');
  return {
    ...actual,
    ResultTemplatesHelpers: {
      getResultProperty: vi.fn(() => 1024),
    },
  };
});

@customElement('test-formatter')
class TestFormatter extends LitElement {
  firstUpdated(
    _changedProperties: Map<string | number | symbol, unknown>
  ): void {
    super.updated(_changedProperties);
    const event = new CustomEvent('atomic/numberFormat', {
      detail: (value: number) => `000${value}000`,
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

  public render() {
    return html``;
  }
}

void TestFormatter;

describe('atomic-result-number', () => {
  let i18n: i18n;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  const mockedEngine = buildFakeSearchEngine();

  const renderResultNumber = async ({
    props = {},
    slottedContent,
    result = {},
  }: {
    props?: Partial<{field: string}>;
    slottedContent?: TemplateResult;
    result?: Partial<Result>;
  } = {}) => {
    const {element, atomicResult} =
      await renderInAtomicResult<AtomicResultNumber>({
        template: html`<atomic-result-number field=${ifDefined(props.field)}
        >${ifDefined(slottedContent)}</atomic-result-number>`,
        selector: 'atomic-result-number',
        result: result as Result,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.i18n = i18n;
          return bindings;
        },
      });

    return {
      element: element,
      atomicResult,
    };
  };

  describe('when added to the DOM', () => {
    it('should not set the error when the field prop is a non-empty string', async () => {
      const {element} = await renderResultNumber({props: {field: 'size'}});

      expect(element.error).toBeUndefined();
    });

    it('should set the error when the field prop is an empty string', async () => {
      const {element} = await renderResultNumber({props: {field: ''}});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is an empty string/i);
    });

    it('should set the error when the field prop is undefined', async () => {
      const {element} = await renderResultNumber();

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is required/i);
    });

    it('should add an "atomic/numberFormat" event listener', async () => {
      const addEventListenerSpy = vi.spyOn(
        AtomicResultNumber.prototype,
        'addEventListener'
      );

      await renderResultNumber({props: {field: 'size'}});

      expect(addEventListenerSpy).toHaveBeenCalledExactlyOnceWith(
        'atomic/numberFormat',
        expect.any(Function)
      );
    });
  });

  describe('when removed from the DOM', () => {
    it('should remove the "atomic/numberFormat" event listener', async () => {
      const {element} = await renderResultNumber({props: {field: 'size'}});
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledExactlyOnceWith(
        'atomic/numberFormat',
        expect.any(Function)
      );
    });
  });

  describe('when the field property changes', () => {
    it('should not set the error when updating to a non-empty string', async () => {
      const {element} = await renderResultNumber({props: {field: 'size'}});

      element.field = 'price';
      element.updateComplete;

      expect(element.error).toBeUndefined();
    });

    it('should set the error when updating to an empty string', async () => {
      const {element} = await renderResultNumber({props: {field: 'size'}});

      element.field = '';
      await element.updateComplete;

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is an empty string/i);
    });

    it('should set the error when updating to undefined', async () => {
      const {element} = await renderResultNumber({props: {field: 'size'}});

      // @ts-expect-error - Testing invalid value
      element.field = undefined;
      await element.updateComplete;

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is required/i);
    });
  });

  describe('when rendering', () => {
    it('should remove itself from the DOM when the field value is null', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(null);

      const {element} = await renderResultNumber({
        props: {field: 'missing'},
      });

      expect(element).not.toBeInTheDocument();
    });

    it('should set the error when the field value cannot be parsed as a number', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        'not a number'
      );

      const {element} = await renderResultNumber({props: {field: 'invalid'}});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe(
        'Could not parse "not a number" from field "invalid" as a number.'
      );
    });

    describe('when using the default formatter', () => {
      it('should set the error when the formatter throws', async () => {
        // Ensure the mock returns a valid number
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          1234.56
        );

        @customElement('test-throwing-formatter')
        class TestThrowingFormatter extends LitElement {
          firstUpdated(
            _changedProperties: Map<string | number | symbol, unknown>
          ): void {
            super.updated(_changedProperties);
            const event = new CustomEvent('atomic/numberFormat', {
              detail: () => {
                throw new Error('Formatter error');
              },
              bubbles: true,
              cancelable: true,
            });
            this.dispatchEvent(event);
          }

          public render() {
            return html``;
          }
        }

        void TestThrowingFormatter;

        const {element} = await renderResultNumber({
          props: {field: 'size'},
          slottedContent: html`<test-throwing-formatter></test-throwing-formatter>`,
        });

        expect(element.error).toBeInstanceOf(Error);
        expect(element.error.message).toBe('Formatter error');
      });

      it('should format a valid number value', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          1234.56
        );

        const {element} = await renderResultNumber({props: {field: 'size'}});

        expect(element).toHaveTextContent('1,234.56');
      });

      it('should format a valid string value that can be parsed to a number', async () => {
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          '1234.56'
        );

        const {element} = await renderResultNumber({props: {field: 'price'}});

        expect(element).toHaveTextContent('1,234.56');
      });

      it('should format using the active i18n language', async () => {
        await i18n.changeLanguage('fr');
        vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
          1234.56
        );

        const {element} = await renderResultNumber({props: {field: 'size'}});

        expect(element).toHaveTextContent('1 234,56');
      });
    });

    it('should use the specified formatter instead of the default one when it has a slotted formatter', async () => {
      vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(
        1234.56
      );
      const {element} = await renderResultNumber({
        props: {field: 'price'},
        slottedContent: html`<test-formatter></test-formatter>`,
      });

      expect(element).toHaveTextContent('0001234.56000');
    });
  });

  it('should set the error when not used in a result template', async () => {
    const {atomicInterface} =
      await renderInAtomicSearchInterface<AtomicResultNumber>({
        template: html`<atomic-result-number
            field="size"
          ></atomic-result-number>`,
        selector: undefined,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    const element = atomicInterface.querySelector<AtomicResultNumber>(
      'atomic-result-number'
    );

    expect(element).toBeInTheDocument();
    expect(element!.error).toBeInstanceOf(Error);
    expect(element!.error.message).toBe(
      'The "atomic-result-number" element must be the child of an "atomic-result" element.'
    );
  });
});
