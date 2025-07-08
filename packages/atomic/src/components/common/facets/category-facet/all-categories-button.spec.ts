/* eslint-disable @cspell/spellchecker */
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {vi, expect, describe, it} from 'vitest';
import type {CategoryFacetAllCategoryButtonProps} from './all-categories-button';
import {renderCategoryFacetAllCategoryButton} from './all-categories-button';

describe('renderCategoryFacetAllCategoryButton', () => {
  const mockI18n = {
    t: vi.fn((key: string) => {
      if (key === 'all-categories') {
        return 'All Categories';
      }
      return key;
    }),
  };

  const defaultProps: CategoryFacetAllCategoryButtonProps = {
    i18n: mockI18n as unknown as i18n,
    onClick: vi.fn(),
  };

  const renderComponent = (props: Partial<typeof defaultProps> = {}) => {
    const mergedProps = {
      ...defaultProps,
      ...props,
    } as CategoryFacetAllCategoryButtonProps;
    return renderFunctionFixture(
      html`${renderCategoryFacetAllCategoryButton({props: mergedProps})}`
    );
  };

  it('renders the button with correct text', async () => {
    await renderComponent();
    const button = page.getByRole('button');
    await expect.element(button).toBeInTheDocument();
    await expect.element(button).toHaveTextContent('All Categories');
  });

  it('calls onClick when button is clicked', async () => {
    const onClickMock = vi.fn();
    await renderComponent({onClick: onClickMock});

    const button = page.getByRole('button').element();
    button?.dispatchEvent(new MouseEvent('click'));

    expect(onClickMock).toHaveBeenCalled();
  });

  it('renders the back arrow icon', async () => {
    const container = await renderComponent();
    const icon = container.querySelector('atomic-icon');

    await expect.element(icon).toBeInTheDocument();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.getAttribute('part')).toBe('back-arrow');
  });

  it('applies the correct part attribute to the button', async () => {
    await renderComponent();
    const button = page.getByRole('button');
    await expect
      .element(button)
      .toHaveAttribute('part', 'all-categories-button');
  });

  it('applies the truncate class to the text span', async () => {
    const container = await renderComponent();
    const textSpan = container.querySelector('span.truncate');

    await expect.element(textSpan).toBeInTheDocument();
    await expect.element(textSpan).toHaveTextContent('All Categories');
  });

  it('uses the correct i18n translation', () => {
    renderComponent();
    expect(mockI18n.t).toHaveBeenCalledWith('all-categories');
  });

  it('renders with different translation text', async () => {
    const customI18n = {
      t: vi.fn(() => 'Todas las categorías'),
    };

    await renderComponent({i18n: customI18n});
    const button = page.getByRole('button');
    await expect.element(button).toHaveTextContent('Todas las categorías');
  });
});
