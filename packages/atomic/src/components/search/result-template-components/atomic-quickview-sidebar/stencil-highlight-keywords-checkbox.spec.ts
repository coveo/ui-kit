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
import {HighlightKeywordsCheckbox} from './stencil-highlight-keywords-checkbox';

describe('HighlightKeywordsCheckbox (Stencil)', () => {
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
    highlightKeywords?: HighlightKeywords;
    onHighlightKeywords?: (highlight: HighlightKeywords) => void;
    minimized?: boolean;
  }) => {
    const onHighlightKeywords = props?.onHighlightKeywords ?? vi.fn();
    const highlightKeywords = props?.highlightKeywords ?? baseHighlightKeywords;

    const vnode = HighlightKeywordsCheckbox(
      {
        i18n,
        highlightKeywords,
        onHighlightKeywords,
        minimized: props?.minimized ?? false,
      },
      [],
      // biome-ignore lint/suspicious/noExplicitAny: Stencil FunctionalComponent requires utils parameter but it's not used
      {} as any
    ) as VNode;

    await renderStencilVNode(vnode, container);

    return {onHighlightKeywords};
  };

  it('renders the checkbox with translated label', async () => {
    await renderComponent({minimized: false});

    const checkbox = container.querySelector(
      '#atomic-quickview-sidebar-highlight-keywords'
    ) as HTMLButtonElement | null;
    const label = container.querySelector('label');

    const translation = i18n.t('keywords-highlight');

    expect(checkbox).toBeTruthy();
    expect(label?.textContent).toBe(translation);
    expect(label?.getAttribute('for')).toBe(
      'atomic-quickview-sidebar-highlight-keywords'
    );
    expect(checkbox?.getAttribute('aria-checked')).toBe('true');
  });

  it('hides the label when minimized', async () => {
    await renderComponent({minimized: true});

    const label = container.querySelector('label');
    expect(label).toBeNull();
  });

  it('calls onHighlightKeywords with highlightNone toggled when checkbox changes', async () => {
    const onHighlightKeywords = vi.fn();
    await renderComponent({
      onHighlightKeywords,
      highlightKeywords: {...baseHighlightKeywords, highlightNone: true},
    });

    const checkbox = container.querySelector(
      '#atomic-quickview-sidebar-highlight-keywords'
    ) as HTMLButtonElement | null;

    expect(checkbox?.getAttribute('aria-checked')).toBe('false');

    checkbox?.click();

    expect(onHighlightKeywords).toHaveBeenCalledWith({
      highlightNone: false,
      keywords: {},
    });
  });
});
