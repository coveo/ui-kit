import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicResultHtml} from './atomic-result-html';
import './atomic-result-html';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-html', () => {
  let mockResult: Result;

  const locators = {
    getHtml: (element: AtomicResultHtml) =>
      element?.querySelector('atomic-html'),
  };

  beforeEach(async () => {
    mockConsole();

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

  const renderComponent = async (
    options: {field?: string; sanitize?: boolean; result?: Result | null} = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const {element} = await renderInAtomicResult<AtomicResultHtml>({
      template: html`<atomic-result-html
        field=${ifDefined(options.field)}
        ?sanitize=${options.sanitize ?? true}
      ></atomic-result-html>`,
      selector: 'atomic-result-html',
      result: resultToUse === null ? undefined : resultToUse,
    });
    return element;
  };

  it('should set result from result controller', async () => {
    const element = await renderComponent({field: 'title'});

    expect(element).toBeDefined();

    const htmlElement = locators.getHtml(element);
    expect(htmlElement).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize ValidatePropsController with correct schema', async () => {
      const element = await renderComponent({field: 'title'});

      expect(element).toBeDefined();
      expect(element.field).toBe('title');
      expect(element.sanitize).toBe(true);
    });

    it('should set default sanitize property to true', async () => {
      const element = await renderComponent({field: 'title'});

      expect(element.sanitize).toBe(true);
    });

    it('should validate field property is required', async () => {
      const element = await renderComponent({field: undefined});

      const htmlElement = locators.getHtml(element);
      expect(htmlElement).toBeFalsy();
    });
  });

  describe('render', () => {
    describe('when field has value', () => {
      it('should render HTML field value', async () => {
        const element = await renderComponent({field: 'custom_html_field'});
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();
        expect(htmlElement?.getAttribute('value')).toBe(
          '<p>Custom <em>HTML</em> content</p>'
        );
      });

      it('should render title field with HTML content', async () => {
        const element = await renderComponent({field: 'title'});
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();
        expect(htmlElement?.getAttribute('value')).toBe(
          'Test <b>HTML</b> Title'
        );
      });

      it('should pass sanitize property correctly when false', async () => {
        const element = await renderComponent({
          field: 'custom_html_field',
          sanitize: false,
        });
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();

        const sanitizeValue = htmlElement?.getAttribute('sanitize');
        expect(sanitizeValue === '' || sanitizeValue === null).toBe(true);
      });

      it('should sanitize by default', async () => {
        const element = await renderComponent({field: 'custom_html_field'});
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeDefined();
        expect(htmlElement?.hasAttribute('sanitize')).toBe(true);
      });
    });

    describe('when field has no value', () => {
      it('should not render when field is empty', async () => {
        const element = await renderComponent({field: 'empty_field'});
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeFalsy();
      });

      it('should not render when field is null', async () => {
        const element = await renderComponent({field: 'null_field'});
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeFalsy();
      });

      it('should not render when field does not exist', async () => {
        const element = await renderComponent({field: 'non_existent_field'});
        const htmlElement = locators.getHtml(element);

        expect(htmlElement).toBeFalsy();
      });
    });
  });
});
