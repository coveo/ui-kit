import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';
import {renderQuickviewSidebar} from './atomic-quickview-sidebar';
import {identifierKeywordsSection} from './keywords';

describe('QuickviewSidebar (Lit)', () => {
  let container: HTMLElement;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const createWord = (text: string) => {
    const element = document.createElement('span');
    element.scrollIntoView = vi.fn();
    return new QuickviewWordHighlight(`${text}-id`, text, '#123456', element);
  };

  const baseHighlightKeywords: HighlightKeywords = {
    highlightNone: false,
    keywords: {},
  };

  /**
   * Helper to render the Lit functional component into the DOM.
   */
  const renderComponent = async (props?: {
    minimized?: boolean;
    highlightKeywords?: HighlightKeywords;
    words?: Record<string, QuickviewWordHighlight>;
    onHighlightKeywords?: (highlight: HighlightKeywords) => void;
    onMinimize?: (minimize: boolean) => void;
  }) => {
    const words = props?.words ?? {
      alpha: createWord('alpha'),
      beta: createWord('beta'),
    };

    container = await renderFunctionFixture(
      html`${renderQuickviewSidebar({
        props: {
          i18n,
          words,
          minimized: props?.minimized ?? false,
          highlightKeywords: props?.highlightKeywords ?? baseHighlightKeywords,
          onHighlightKeywords: props?.onHighlightKeywords ?? vi.fn(),
          onMinimize: props?.onMinimize ?? vi.fn(),
        },
      })}`
    );
  };

  it('renders keywords and controls when expanded', async () => {
    await renderComponent({minimized: false});

    const keywordsSection = container.querySelector(
      `#${identifierKeywordsSection}`
    );
    const minimizeButton = container.querySelector(
      '[part="sidebar-minimize-button"]'
    );
    const highlightLabel = container.querySelector('label');

    expect(keywordsSection).toBeTruthy();
    expect(minimizeButton).toBeTruthy();
    expect(highlightLabel?.textContent).toBe(i18n.t('keywords-highlight'));
  });

  it('hides keywords when minimized', async () => {
    await renderComponent({minimized: true});

    const keywordsSection = container.querySelector(
      `#${identifierKeywordsSection}`
    );
    const highlightLabel = container.querySelector('label');

    expect(keywordsSection).toBeNull();
    expect(highlightLabel).toBeNull();
  });

  it('toggles minimize state when clicking the button', async () => {
    const onMinimize = vi.fn();
    await renderComponent({minimized: false, onMinimize});

    const minimizeButton = container.querySelector(
      '[part="sidebar-minimize-button"]'
    ) as HTMLButtonElement | null;

    expect(minimizeButton).toBeTruthy();
    minimizeButton?.click();

    expect(onMinimize).toHaveBeenCalledWith(true);
  });

  it('propagates highlight checkbox changes', async () => {
    const onHighlightKeywords = vi.fn();
    await renderComponent({
      onHighlightKeywords,
      highlightKeywords: {...baseHighlightKeywords, highlightNone: false},
    });

    const checkbox = container.querySelector(
      '#atomic-quickview-sidebar-highlight-keywords'
    ) as HTMLButtonElement | null;

    expect(checkbox).toBeTruthy();
    checkbox?.click();

    expect(onHighlightKeywords).toHaveBeenCalledWith({
      highlightNone: true,
      keywords: {},
    });
  });
});
