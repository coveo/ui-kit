import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import type {AtomicResultHtml} from './atomic-result-html';
import './atomic-result-html';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-html', () => {
  let mockResult: Result;
  const mockedEngine = buildFakeSearchEngine();

  const locators = {
    getHtml: (element: AtomicResultHtml) =>
      element?.querySelector('atomic-html'),
  };

  beforeEach(async () => {
    mockResult = buildFakeResult({
      title: 'Test <b>HTML</b> Title',
      raw: {
        custom_html_field: '<p>Custom <em>HTML</em> content</p>',
        plain_field: 'Plain text content',
        empty_field: '',
        null_field: null,
      },
    });
  });

  const renderResultHtml = async ({
    props = {},
    result = mockResult,
  }: {
    props?: Partial<{field: string; sanitize: boolean}>;
    result?: Result | null;
  } = {}) => {
    const {element} = await renderInAtomicResult<AtomicResultHtml>({
      template: html`<atomic-result-html
        field=${ifDefined(props.field)}
        ?sanitize=${props.sanitize ?? true}
      ></atomic-result-html>`,
      selector: 'atomic-result-html',
      result: result === null ? undefined : result,
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
    };
  };

  describe('when added to the DOM', () => {
    it('should not set the error when the field prop is a non-empty string', async () => {
      const {element} = await renderResultHtml({props: {field: 'title'}});

      expect(element.error).toBeUndefined();
    });

    it('should set the error when the field prop is an empty string', async () => {
      const {element} = await renderResultHtml({props: {field: ''}});

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is an empty string/i);
    });

    it('should set the error when the field prop is undefined', async () => {
      const {element} = await renderResultHtml();

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is required/i);
    });
  });

  describe('when the field property changes', () => {
    it('should not set the error when updating to a non-empty string', async () => {
      const {element} = await renderResultHtml({props: {field: 'title'}});

      element.field = 'custom_html_field';
      await element.updateComplete;

      expect(element.error).toBeUndefined();
    });

    it('should set the error when updating to an empty string', async () => {
      const {element} = await renderResultHtml({props: {field: 'title'}});

      element.field = '';
      await element.updateComplete;

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is an empty string/i);
    });

    it('should set the error when updating to undefined', async () => {
      const {element} = await renderResultHtml({props: {field: 'title'}});

      // @ts-expect-error - Testing invalid value
      element.field = undefined;
      await element.updateComplete;

      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toMatch(/field: value is required/i);
    });
  });

  describe('when rendering', () => {
    describe('when field has value', () => {
      it('should render HTML field value', async () => {
        const {element} = await renderResultHtml({
          props: {field: 'custom_html_field'},
        });
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();
        expect(htmlElement?.getAttribute('value')).toBe(
          '<p>Custom <em>HTML</em> content</p>'
        );
      });

      it('should render title field with HTML content', async () => {
        const {element} = await renderResultHtml({props: {field: 'title'}});
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();
        expect(htmlElement?.getAttribute('value')).toBe(
          'Test <b>HTML</b> Title'
        );
      });

      it('should pass sanitize property correctly when false', async () => {
        const {element} = await renderResultHtml({
          props: {field: 'custom_html_field', sanitize: false},
        });
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();

        const sanitizeValue = htmlElement?.getAttribute('sanitize');
        expect(sanitizeValue === '' || sanitizeValue === null).toBe(true);
      });

      it('should sanitize by default', async () => {
        const {element} = await renderResultHtml({
          props: {field: 'custom_html_field'},
        });
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();
        expect(htmlElement?.hasAttribute('sanitize')).toBe(true);
      });
    });

    describe('when field has no value', () => {
      it('should not render when field is empty', async () => {
        const {element} = await renderResultHtml({
          props: {field: 'empty_field'},
        });
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeFalsy();
      });

      it('should not render when field is null', async () => {
        const {element} = await renderResultHtml({
          props: {field: 'null_field'},
        });
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeFalsy();
      });

      it('should not render when field does not exist', async () => {
        const {element} = await renderResultHtml({
          props: {field: 'non_existent_field'},
        });
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeFalsy();
      });
    });
  });

  it('should set the error when not used in a result template', async () => {
    const {atomicInterface} =
      await renderInAtomicSearchInterface<AtomicResultHtml>({
        template: html`<atomic-result-html
          field="title"
        ></atomic-result-html>`,
        selector: undefined,
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    const element =
      atomicInterface.querySelector<AtomicResultHtml>('atomic-result-html');

    expect(element).toBeInTheDocument();
    expect(element!.error).toBeInstanceOf(Error);
    expect(element!.error.message).toBe(
      'The "atomic-result-html" element must be the child of an "atomic-result" element.'
    );
  });
});
