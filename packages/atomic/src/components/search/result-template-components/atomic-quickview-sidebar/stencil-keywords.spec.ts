import type {VNode} from '@stencil/core';
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
import type {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';
import {Keywords} from './stencil-keywords';

describe('Keywords (Stencil)', () => {
  let container: HTMLElement;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const createWord = (text: string, options?: {occurrences?: number}) => {
    const navigateForward = vi.fn();
    const navigateBackward = vi.fn();
    const word = {
      text,
      color: '#123456',
      indexIdentifier: `${text}-id`,
      occurrences: options?.occurrences ?? 3,
      navigateForward,
      navigateBackward,
    } as unknown as QuickviewWordHighlight;
    return {word, navigateForward, navigateBackward};
  };

  /**
   * Helper to render the Stencil functional component into the DOM.
   *
   * For Lit migration: replace this with a helper that renders the Lit
   * component directly (e.g., renderFunctionFixture).
   */
  const renderComponent = async (props?: {
    words?: Record<string, QuickviewWordHighlight>;
    highlightKeywords?: HighlightKeywords;
    onHighlightKeywords?: (highlight: HighlightKeywords) => void;
  }) => {
    const onHighlightKeywords = props?.onHighlightKeywords ?? vi.fn();
    const highlightKeywords =
      props?.highlightKeywords ??
      ({
        highlightNone: false,
        keywords: {},
      } satisfies HighlightKeywords);

    const words =
      props?.words ??
      (() => {
        const {word} = createWord('alpha');
        return {alpha: word};
      })();

    const vnode = Keywords(
      {
        i18n,
        onHighlightKeywords,
        highlightKeywords,
        words,
      },
      [],
      // biome-ignore lint/suspicious/noExplicitAny: Stencil FunctionalComponent requires utils parameter but it's not used
      {} as any
    ) as VNode;

    await renderStencilVNode(vnode, container);

    return {onHighlightKeywords, words};
  };

  it('renders keyword details with formatted count and legend label', async () => {
    const {word} = createWord('ocean', {occurrences: 3});
    await renderComponent({words: {ocean: word}});

    const text = container.textContent?.replace(/\s+/g, ' ').trim();
    expect(text).toContain('ocean');
    expect(text).toContain('(3)');

    const colorSwatch = container.querySelector(
      '.mr-2.h-5.w-5.flex-none'
    ) as HTMLElement | null;
    expect(colorSwatch).toBeTruthy();

    const legend = container.querySelector('legend');
    expect(legend?.textContent).toBe(
      i18n.t('quickview-navigate-keywords', {
        occurrences: 3,
        keyword: 'ocean',
      })
    );
  });

  it('calls navigation callbacks when clicking next/previous', async () => {
    const {word, navigateForward, navigateBackward} = createWord('river');
    await renderComponent({words: {river: word}});

    const nextButton = container.querySelector(
      '[part="sidebar-next-button"]'
    ) as HTMLButtonElement | null;
    const previousButton = container.querySelector(
      '[part="sidebar-previous-button"]'
    ) as HTMLButtonElement | null;

    expect(nextButton).toBeTruthy();
    expect(previousButton).toBeTruthy();

    nextButton?.click();
    previousButton?.click();

    expect(navigateForward).toHaveBeenCalledTimes(1);
    expect(navigateBackward).toHaveBeenCalledTimes(1);
  });

  it('toggles highlight state when clicking the remove/add button', async () => {
    const {word} = createWord('forest');
    const onHighlightKeywords = vi.fn();
    await renderComponent({
      words: {forest: word},
      onHighlightKeywords,
      highlightKeywords: {highlightNone: false, keywords: {}},
    });

    const toggleButton = container.querySelector(
      '[part="sidebar-remove-word-button"]'
    ) as HTMLButtonElement | null;

    toggleButton?.click();

    expect(onHighlightKeywords).toHaveBeenCalledWith({
      highlightNone: false,
      keywords: {
        forest: {
          enabled: false,
          indexIdentifier: 'forest-id',
        },
      },
    });
  });

  it('disables interactions when highlights are globally disabled', async () => {
    const {word} = createWord('desert');
    await renderComponent({
      words: {desert: word},
      highlightKeywords: {
        highlightNone: true,
        keywords: {},
      },
    });

    const navigationContainer = container.querySelector(
      '.bg-background'
    ) as HTMLElement | null;
    const toggleButton = container.querySelector(
      '[part="sidebar-remove-word-button"]'
    ) as HTMLButtonElement | null;
    const nextButton = container.querySelector(
      '[part="sidebar-next-button"]'
    ) as HTMLButtonElement | null;
    const previousButton = container.querySelector(
      '[part="sidebar-previous-button"]'
    ) as HTMLButtonElement | null;

    expect(navigationContainer?.className).toContain('opacity-50');
    expect(nextButton?.disabled).toBe(true);
    expect(previousButton?.disabled).toBe(true);
    expect(toggleButton?.getAttribute('tabindex')).toBe('-1');
    expect(toggleButton?.getAttribute('aria-pressed')).toBe('true');
  });
});
