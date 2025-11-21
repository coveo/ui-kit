import type {Result} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AtomicResultBadge} from './atomic-result-badge';
import './atomic-result-badge';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-badge', () => {
  let i18n: i18n;
  let mockResult: Result;

  beforeEach(async () => {
    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        trending: 'Trending',
        'hello-world': 'Hello, World!',
      },
      true
    );

    mockResult = buildFakeResult({
      raw: {
        filetype: 'pdf',
        objecttype: 'document',
      },
    });

    vi.mocked(ResultTemplatesHelpers.getResultProperty).mockImplementation(
      (result: Result, property: string) => {
        return result.raw[property] ?? null;
      }
    );
  });

  const renderComponent = async (
    options: {
      field?: string;
      label?: string;
      icon?: string;
      slottedContent?: string;
      result?: Result;
    } = {}
  ) => {
    const resultToUse = options.result ?? mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultBadge>({
        template: html`<atomic-result-badge
          field=${ifDefined(options.field)}
          label=${ifDefined(options.label)}
          icon=${ifDefined(options.icon)}
          >${options.slottedContent}</atomic-result-badge
        >`,
        selector: 'atomic-result-badge',
        result: resultToUse,
        bindings: (bindings) => {
          bindings.i18n = i18n;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return {
      element,
      badgeElement: () =>
        element?.shadowRoot?.querySelector('[part="result-badge-element"]'),
      iconPart: () =>
        element?.shadowRoot?.querySelector('[part="result-badge-icon"]'),
      labelPart: () =>
        element?.shadowRoot?.querySelector('[part="result-badge-label"]'),
      icon: () => element?.shadowRoot?.querySelector('atomic-icon'),
      text: () => element?.shadowRoot?.querySelector('atomic-text'),
      resultText: () =>
        element?.shadowRoot?.querySelector('atomic-result-text'),
      slot: () => element?.shadowRoot?.querySelector('slot'),
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-badge');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  describe('when rendering with #field', () => {
    it('should render atomic-result-text with the specified field', async () => {
      const {resultText} = await renderComponent({field: 'filetype'});

      expect(resultText()).toBeDefined();
      expect(resultText()?.getAttribute('field')).toBe('filetype');
    });

    it('should render the field value when field exists', async () => {
      const {element, text, resultText} = await renderComponent({
        field: 'filetype',
      });

      expect(element).toBeDefined();
      expect(resultText()).toBeDefined();
      expect(text()).toHaveAttribute('value', 'pdf');
    });

    it('should remove itself when field value does not exist', async () => {
      const {element} = await renderComponent({field: 'nonexistent'});

      expect(element).not.toBeInTheDocument();
    });
  });

  describe('when rendering with #label', () => {
    it('should render atomic-text with the specified label', async () => {
      const {labelPart} = await renderComponent({label: 'trending'});

      expect(labelPart()).toBeInTheDocument();
    });

    it('should render the localized label text', async () => {
      const {text} = await renderComponent({label: 'hello-world'});

      const textElement = text();
      expect(textElement?.shadowRoot?.textContent).toContain('Hello, World!');
    });
  });

  describe('when rendering with #icon', () => {
    it('should render atomic-icon when icon is specified', async () => {
      const {icon} = await renderComponent({
        label: 'trending',
        icon: 'assets://star',
      });

      expect(icon()).toBeDefined();
    });

    it('should not render icon when icon is not specified', async () => {
      const {icon} = await renderComponent({label: 'trending'});

      expect(icon()).toBeNull();
    });

    it('should render icon with correct part attribute', async () => {
      const {iconPart} = await renderComponent({
        label: 'trending',
        icon: 'assets://star',
      });

      expect(iconPart()).toBeDefined();
      expect(iconPart()?.getAttribute('part')).toBe('result-badge-icon');
    });
  });

  describe('when rendering with slotted content', () => {
    it('should render slotted content', async () => {
      const {slot, text, resultText} = await renderComponent({
        slottedContent: '<span>Custom content</span>',
      });

      expect(slot()).toBeDefined();
      expect(text()).toBeNull();
      expect(resultText()).toBeNull();
    });

    it('should render slotted content with icon', async () => {
      const {slot, icon} = await renderComponent({
        icon: 'assets://stopwatch',
        slottedContent: '<span>Deal ends soon</span>',
      });

      expect(slot()).toBeDefined();
      expect(icon()).toBeDefined();
    });
  });

  describe('shadow parts', () => {
    it('should expose result-badge-element part', async () => {
      const {badgeElement} = await renderComponent({label: 'test'});

      expect(badgeElement()).toBeDefined();
      expect(badgeElement()?.getAttribute('part')).toBe('result-badge-element');
    });

    it('should expose result-badge-label part', async () => {
      const {labelPart} = await renderComponent({label: 'test'});

      expect(labelPart()).toBeDefined();
      expect(labelPart()?.getAttribute('part')).toBe('result-badge-label');
    });
  });
});
