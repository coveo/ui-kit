import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {renderHighlightKeywordsCheckbox} from './highlight-keywords-checkbox';

describe('HighlightKeywordsCheckbox (Lit)', () => {
  let container: HTMLElement;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const baseHighlightKeywords: HighlightKeywords = {
    highlightNone: false,
    keywords: {},
  };

  const renderComponent = async (props?: {
    highlightKeywords?: HighlightKeywords;
    onHighlightKeywords?: (highlight: HighlightKeywords) => void;
    minimized?: boolean;
  }) => {
    const onHighlightKeywords = props?.onHighlightKeywords ?? vi.fn();
    const highlightKeywords = props?.highlightKeywords ?? baseHighlightKeywords;

    container = await renderFunctionFixture(
      html`${renderHighlightKeywordsCheckbox({
        props: {
          i18n,
          highlightKeywords,
          onHighlightKeywords,
          minimized: props?.minimized ?? false,
        },
      })}`
    );

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
