import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicCommerceText} from './atomic-commerce-text';

describe('atomic-commerce-text', () => {
  let i18n: i18n;

  beforeEach(async () => {
    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        'test-key': 'A single product',
        'test-key_plural': '{{count}} products',
      },
      true
    );
  });

  const renderComponent = async (
    options: {value?: string; count?: number} = {}
  ) => {
    const {element, atomicInterface} =
      await renderInAtomicCommerceInterface<AtomicCommerceText>({
        template: html`<atomic-commerce-text
          .value=${options.value || ''}
          .count=${options.count}
        ></atomic-commerce-text>`,
        selector: 'atomic-commerce-text',
        bindings: (bindings) => {
          bindings.interfaceElement.type = 'product-listing';
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
    await element.updateComplete;

    return element;
  };

  it('should be defined', async () => {
    const el = await renderComponent();
    expect(el).toBeInstanceOf(AtomicCommerceText);
  });

  it('should render with basic translation when value is provided', async () => {
    const element = await renderComponent({value: 'test-key'});

    expect(element).toBeDefined();
    expect(element.value).toBe('test-key');
  });
  it('should call i18n translation with value and count', async () => {
    const spy = vi.spyOn(i18n, 't');
    const element = await renderComponent({value: 'test-key_plural', count: 2});

    await element.updateComplete;

    expect(spy).toHaveBeenCalledWith('test-key_plural', {
      count: 2,
    });
  });

  it('should render translated text correctly', async () => {
    const element = await renderComponent({value: 'test-key'});

    await element.updateComplete;

    const shadowContent = element.shadowRoot?.textContent?.trim();
    expect(shadowContent).toBe('A single product');
  });

  it('should render translated text with count correctly', async () => {
    const element = await renderComponent({value: 'test-key_plural', count: 2});

    await element.updateComplete;

    const shadowContent = element.shadowRoot?.textContent?.trim();
    expect(shadowContent).toBe('2 products');
  });

  it('should handle count property updates', async () => {
    const element = await renderComponent({value: 'test-key', count: 1});

    element.count = 2;
    await element.updateComplete;

    expect(element.count).toBe(2);
  });

  it('should handle value property updates', async () => {
    const element = await renderComponent({value: 'original-key'});

    element.value = 'new-key';
    await element.updateComplete;

    expect(element.value).toBe('new-key');
  });

  it('should not set error when value is provided', async () => {
    const element = await renderComponent({value: 'test-key'});

    expect(element.error).toBeUndefined();
  });

  it('should set error when value is not provided', async () => {
    const element = await renderComponent();

    expect(element.error).toBeDefined();
    expect(element.error.message).toBe(
      'The "value" attribute must be defined.'
    );
  });

  it('should set error when value is empty string', async () => {
    const element = await renderComponent({value: ''});

    expect(element.error).toBeDefined();
    expect(element.error.message).toBe(
      'The "value" attribute must be defined.'
    );
  });

  describe('when error is present', () => {
    it('should render error component when value is missing', async () => {
      const element = await renderComponent();

      expect(element.error).toBeDefined();
      expect(element.error.message).toBe(
        'The "value" attribute must be defined.'
      );
    });
  });

  describe('when count is not provided', () => {
    it('should work with undefined count', async () => {
      const element = await renderComponent({value: 'test-key'});

      expect(element.count).toBeUndefined();
      const shadowContent = element.shadowRoot?.textContent?.trim();
      expect(shadowContent).toBe('A single product');
    });
  });

  describe('when different interface types are used', () => {
    it('should work with search interface type', async () => {
      const {element} =
        await renderInAtomicCommerceInterface<AtomicCommerceText>({
          template: html`<atomic-commerce-text
            .value=${'test-key'}
          ></atomic-commerce-text>`,
          selector: 'atomic-commerce-text',
          bindings: (bindings) => {
            bindings.interfaceElement.type = 'search';
            bindings.i18n = i18n;
            return bindings;
          },
        });

      expect(element).toBeDefined();
      expect(element.value).toBe('test-key');
    });
  });

  describe('when testing edge cases', () => {
    it('should handle special characters in value', async () => {
      const element = await renderComponent({
        value: 'test-key-with-special-chars-éàü',
      });

      expect(element.value).toBe('test-key-with-special-chars-éàü');
    });

    it('should handle very large count values', async () => {
      const element = await renderComponent({
        value: 'test-key_plural',
        count: 999999,
      });

      expect(element.count).toBe(999999);
    });

    it('should handle zero count', async () => {
      const element = await renderComponent({
        value: 'test-key_plural',
        count: 0,
      });

      expect(element.count).toBe(0);
      const shadowContent = element.shadowRoot?.textContent?.trim();
      expect(shadowContent).toBe('0 products');
    });

    it('should handle negative count values', async () => {
      const element = await renderComponent({
        value: 'test-key_plural',
        count: -1,
      });

      expect(element.count).toBe(-1);
    });
  });
});
