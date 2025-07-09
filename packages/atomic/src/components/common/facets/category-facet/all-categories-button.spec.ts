/* eslint-disable @cspell/spellchecker */
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {vi, expect, describe, it, beforeAll} from 'vitest';
import type {CategoryFacetAllCategoryButtonProps} from './all-categories-button';
import {renderCategoryFacetAllCategoryButton} from './all-categories-button';

describe('#renderCategoryFacetAllCategoryButton', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = (
    props: Partial<CategoryFacetAllCategoryButtonProps> = {}
  ) => {
    const defaultProps: CategoryFacetAllCategoryButtonProps = {
      i18n,
      onClick: vi.fn(),
    };
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
});
