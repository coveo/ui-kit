import type {Result} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicResultFieldsList} from './atomic-result-fields-list';
import './atomic-result-fields-list';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-fields-list', () => {
  let i18n: i18n;
  let mockResult: Result;

  beforeEach(async () => {
    i18n = await createTestI18n();
    mockResult = buildFakeResult({
      title: 'Test Result',
      raw: {
        urihash: '',
      },
    });
  });

  const renderComponent = async (options: {slottedContent?: string} = {}) => {
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultFieldsList>({
        template: html`<atomic-result-fields-list
          >${unsafeHTML(options.slottedContent ?? '')}</atomic-result-fields-list
        >`,
        selector: 'atomic-result-fields-list',
        result: mockResult,
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

    return {element, atomicInterface};
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-fields-list');
    expect(el).toBeInstanceOf(AtomicResultFieldsList);
  });

  it('should render slotted content', async () => {
    const {element} = await renderComponent({
      slottedContent: '<span class="test-child">Test Content</span>',
    });

    const child = element.querySelector('.test-child');
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe('Test Content');
  });

  it('should render in the document', async () => {
    await renderComponent({
      slottedContent: '<span>Item 1</span><span>Item 2</span>',
    });

    const locator = page.getByText('Item 1');
    await expect.element(locator).toBeInTheDocument();
  });

  describe('when there are multiple children', () => {
    it('should render all children', async () => {
      const {element} = await renderComponent({
        slottedContent:
          '<span class="field">Field 1</span><span class="field">Field 2</span><span class="field">Field 3</span>',
      });

      const children = element.querySelectorAll('.field');
      expect(children.length).toBe(3);
    });
  });

  describe('when result context is available', () => {
    it('should not have an error', async () => {
      const {element} = await renderComponent();
      // error is null when no error has been set
      expect(element.error).toBeFalsy();
    });
  });
});
