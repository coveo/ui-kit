import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {expect, vi, describe, beforeAll, it} from 'vitest';
import {renderFacetValueBox} from './facet-value-box';

describe('renderFacetValueBox', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const locators = {
    get listItem() {
      return page.getByRole('listitem');
    },
    get button() {
      return page.getByRole('button');
    },
    get valueCount() {
      return page.getByText('(42)');
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (
    props = {},
    children = html`Some Value Label`
  ) => {
    const baseProps = {
      displayValue: 'Test Value',
      numberOfResults: 42,
      isSelected: false,
      i18n,
      onClick: vi.fn(),
    };
    return await renderFunctionFixture(
      html`${renderFacetValueBox({props: {...baseProps, ...props}})(children)}`
    );
  };

  it('renders all elements', async () => {
    await setupElement();
    const {listItem, button, valueCount} = locators;
    await expect(listItem).toBeInTheDocument();
    await expect(button).toBeInTheDocument();
    await expect(valueCount).toBeInTheDocument();
  });

  it('renders the correct value and count', async () => {
    await setupElement();
    const {button, valueCount} = locators;
    await expect(button).toHaveTextContent('Some Value Label');
    await expect(valueCount).toHaveTextContent('(42)');
  });

  it('applies the correct class and part attributes', async () => {
    await setupElement({class: 'custom-class'});
    const {listItem, button, valueCount} = locators;
    await expect(listItem).toHaveClass('custom-class');
    await expect(button).toHaveAttribute('part', 'value-box');
    await expect(valueCount).toHaveAttribute('part', 'value-count');
  });

  it('calls onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    await setupElement({onClick});
    const {button} = locators;
    await button.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('applies aria attributes and pressed state', async () => {
    await setupElement({isSelected: true});
    const {button} = locators;
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveAttribute(
      'part',
      expect.stringContaining('value-box-selected')
    );
  });
});
