import type {i18n} from 'i18next';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderStencilVNode} from '@/vitest-utils/testing-helpers/stencil-vnode-renderer';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';
import {QuickviewSidebar} from './stencil-atomic-quickview-sidebar';
import {identifierKeywordsSection} from './stencil-keywords';

describe('QuickviewSidebar (Stencil)', () => {
  let container: HTMLElement;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
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
   * Helper to render the Stencil functional component into the DOM.
   *
   * For Lit migration: replace this with a helper that renders the Lit
   * component directly (e.g., renderFunctionFixture).
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

    const vnode = QuickviewSidebar(
      {
        i18n,
        words,
        minimized: props?.minimized ?? false,
        highlightKeywords: props?.highlightKeywords ?? baseHighlightKeywords,
        onHighlightKeywords: props?.onHighlightKeywords ?? vi.fn(),
        onMinimize: props?.onMinimize ?? vi.fn(),
      },
      [],
      // biome-ignore lint/suspicious/noExplicitAny: Stencil FunctionalComponent requires utils parameter but it's not used
      {} as any
    );

    await renderStencilVNode(vnode, container);
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
