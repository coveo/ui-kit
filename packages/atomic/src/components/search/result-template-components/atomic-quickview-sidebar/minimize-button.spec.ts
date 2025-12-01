import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import {identifierKeywordsSection} from './keywords';
import {renderMinimizeButton} from './minimize-button';

describe('MinimizeButton (Lit)', () => {
  let container: HTMLElement;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const baseHighlightKeywords: HighlightKeywords = {
    highlightNone: false,
    keywords: {
      example: {
        indexIdentifier: 'example-id',
        enabled: true,
      },
    },
  };

  const renderComponent = async (props?: {
    minimized?: boolean;
    onMinimize?: (minimize: boolean) => void;
    highlightKeywords?: typeof baseHighlightKeywords;
    wordsLength?: number;
  }) => {
    const onMinimize = props?.onMinimize ?? vi.fn();
    const allProps = {
      i18n,
      minimized: props?.minimized ?? false,
      onMinimize,
      highlightKeywords: props?.highlightKeywords ?? baseHighlightKeywords,
      wordsLength: props?.wordsLength ?? 3,
    };

    container = await renderFunctionFixture(
      html`${renderMinimizeButton({props: allProps})}`
    );

    const wrapper = container.firstElementChild as HTMLElement;
    const button = wrapper.firstElementChild as HTMLButtonElement;

    return {button};
  };

  it('renders a button with translated labels and navigation metadata', async () => {
    const {button} = await renderComponent({minimized: false});
    const translation = i18n.t('quickview-toggle-navigation');

    expect(button).toBeTruthy();
    expect(button?.getAttribute('title')).toBe(translation);
    expect(button?.getAttribute('aria-label')).toBe(translation);
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    expect(button?.getAttribute('aria-controls')).toBe(
      identifierKeywordsSection
    );
  });

  it('calls onMinimize with the toggled value when clicked', async () => {
    const onMinimize = vi.fn();
    const {button} = await renderComponent({minimized: false, onMinimize});

    button?.click();

    expect(onMinimize).toHaveBeenCalledWith(true);
  });

  it('renders a badge with the words length when minimized with keywords', async () => {
    await renderComponent({
      minimized: true,
      wordsLength: 5,
      highlightKeywords: baseHighlightKeywords,
    });

    const badge = container.querySelector(
      '[part=\"sidebar-minimize-badge\"]'
    ) as HTMLElement | null;

    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('5');
  });

  it('does not render a badge when not minimized', async () => {
    await renderComponent({
      minimized: false,
      wordsLength: 5,
      highlightKeywords: baseHighlightKeywords,
    });

    const badge = container.querySelector('[part=\"sidebar-minimize-badge\"]');

    expect(badge).toBeNull();
  });
});
