import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicResultHtml} from './atomic-result-html';
import './atomic-result-html';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-html', () => {
  let mockResult: Result;

  const locators = {
    getHtml: (element: AtomicResultHtml) =>
      element?.querySelector('atomic-html'),
  };

  beforeEach(() => {
    console.error = vi.fn();

    mockResult = buildFakeResult({
      title: 'Test Result Name',
      raw: {
        excerpt: '<div>HTML content</div>',
        custom_html_field: '<p>Custom HTML</p>',
        empty_field: '',
        null_field: null,
      },
    });
  });

  const renderComponent = async (
    options: {field?: string; sanitize?: boolean; result?: Result | null} = {}
  ) => {
    const resultToUse = 'result' in options ? options.result : mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultHtml>({
        template: html`<atomic-result-html
          field=${ifDefined(options.field)}
          ?sanitize=${ifDefined(options.sanitize)}
        ></atomic-result-html>`,
        selector: 'atomic-result-html',
        result: resultToUse === null ? undefined : resultToUse,
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return element;
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-html');
    expect(el).toBeInstanceOf(AtomicResultHtml);
  });

  it('should set error when #field is empty', async () => {
    const element = await renderComponent({field: ''});
    expect(element?.error).toBeDefined();
  });

  describe('when field has HTML content', () => {
    it('should render atomic-html with the field value', async () => {
      const element = await renderComponent({field: 'excerpt'});
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toBeDefined();
    });

    it('should pass the field value to atomic-html', async () => {
      const element = await renderComponent({field: 'excerpt'});
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toHaveProperty('value', '<div>HTML content</div>');
    });

    it('should sanitize by default', async () => {
      const element = await renderComponent({field: 'excerpt'});
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toHaveProperty('sanitize', true);
    });

    it('should respect sanitize=false', async () => {
      const element = await renderComponent({
        field: 'excerpt',
        sanitize: false,
      });
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toHaveProperty('sanitize', false);
    });
  });

  describe('when field has no value', () => {
    it('should not render atomic-html', async () => {
      const element = await renderComponent({field: 'empty_field'});
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toBeNull();
    });

    it('should not render atomic-html for null field', async () => {
      const element = await renderComponent({field: 'null_field'});
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toBeNull();
    });

    it('should not render atomic-html for missing field', async () => {
      const element = await renderComponent({field: 'nonexistent_field'});
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toBeNull();
    });
  });

  describe('with different field types', () => {
    it('should render custom HTML field', async () => {
      const element = await renderComponent({field: 'custom_html_field'});
      const htmlElement = locators.getHtml(element!);
      expect(htmlElement).toBeDefined();
      expect(htmlElement).toHaveProperty('value', '<p>Custom HTML</p>');
    });
  });
});
