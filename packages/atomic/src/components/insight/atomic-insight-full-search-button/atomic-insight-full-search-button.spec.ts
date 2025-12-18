import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine.js';
import type {AtomicInsightFullSearchButton} from './atomic-insight-full-search-button.js';
import './atomic-insight-full-search-button.js';

describe('atomic-insight-full-search-button', () => {
  let mockEngine: ReturnType<typeof buildFakeInsightEngine>;
  let element: AtomicInsightFullSearchButton;

  const setupElement = async (props: {tooltip?: string} = {}) => {
    element = await fixture<AtomicInsightFullSearchButton>(
      html`<atomic-insight-full-search-button
        .tooltip=${props.tooltip ?? ''}
      ></atomic-insight-full-search-button>`
    );

    // Mock the bindings
    element.bindings = {
      engine: mockEngine,
      i18n: {
        t: vi.fn((key: string) => key),
      } as never,
      store: {} as never,
      interfaceElement: {} as never,
      createStyleElement: vi.fn(),
      createScriptElement: vi.fn(),
    };

    // Initialize the component
    element.initialize();

    await element.updateComplete;
    return element;
  };

  beforeEach(() => {
    mockEngine = buildFakeInsightEngine();
  });

  describe('#initialize', () => {
    it('should not throw an error', async () => {
      await expect(setupElement()).resolves.toBeDefined();
    });
  });

  describe('rendering', () => {
    it('should render the full search button', async () => {
      await setupElement();

      const button = element.shadowRoot?.querySelector('button');
      expect(button).toBeVisible();
    });

    it('should render the button with the correct part prefix', async () => {
      await setupElement();

      const container = element.shadowRoot?.querySelector(
        '[part="full-search-container"]'
      );
      const button = element.shadowRoot?.querySelector(
        '[part="full-search-button"]'
      );
      const icon = element.shadowRoot?.querySelector(
        '[part="full-search-icon"]'
      );

      expect(container).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
    });

    it('should render the button with the default aria-label from i18n', async () => {
      await setupElement();

      const button = element.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('aria-label')).toBe('full-search');
      expect(element.bindings.i18n.t).toHaveBeenCalledWith('full-search');
    });

    it('should render the button with an empty title by default', async () => {
      await setupElement();

      const button = element.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('title')).toBe('');
    });

    it('should render the button with a custom tooltip when specified', async () => {
      const customTooltip = 'Go to full search';
      await setupElement({tooltip: customTooltip});

      const button = element.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('title')).toBe(customTooltip);
    });

    it('should render the button with the correct icon', async () => {
      await setupElement();

      const icon = element.shadowRoot?.querySelector('atomic-icon');
      expect(icon).toBeInTheDocument();
      expect(icon?.getAttribute('icon')).toBe('assets://arrow-full.svg');
    });

    it('should render the button with the correct style', async () => {
      await setupElement();

      const button = element.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('class')).toContain('outline-neutral');
    });
  });

  describe('tooltip property', () => {
    it('should have an empty string as default value', async () => {
      await setupElement();

      expect(element.tooltip).toBe('');
    });

    it('should update the title attribute when tooltip property changes', async () => {
      await setupElement();

      const newTooltip = 'Updated tooltip';
      element.tooltip = newTooltip;
      await element.updateComplete;

      const button = element.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('title')).toBe(newTooltip);
    });
  });
});
