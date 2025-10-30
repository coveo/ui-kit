import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderFacetValueBox} from './facet-value-box';

describe('renderFacetValueBox', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const locators = {
    get listItem() {
      return page.getByRole('listitem');
    },
    get button() {
      return page.getByLabelText(
        'Inclusion filter on Test Value; 988M results'
      );
    },
    get valueCount() {
      return page.getByText('(988M)');
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
      numberOfResults: 987654321,
      isSelected: false,
      i18n,
      onClick: vi.fn(),
    };
    return await renderFunctionFixture(
      html`${renderFacetValueBox({props: {...baseProps, ...props}})(children)}`
    );
  };

  it('should render all elements', async () => {
    await setupElement();
    const {listItem, button, valueCount} = locators;
    expect(listItem).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(valueCount).toBeInTheDocument();
  });

  it('should render the correct value and count', async () => {
    await setupElement();
    const {button, valueCount} = locators;
    await expect(button).toHaveTextContent('Some Value Label');
    await expect(valueCount).toHaveTextContent('(988M)');
  });

  it('should apply the correct class and part attributes', async () => {
    await setupElement({class: 'custom-class'});
    const {listItem, button, valueCount} = locators;
    await expect(listItem).toHaveClass('custom-class');
    await expect(button).toHaveAttribute('part', 'value-box');
    await expect(valueCount).toHaveAttribute('part', 'value-count');
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    await setupElement({onClick});
    const {button} = locators;
    await button.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('should apply aria attributes and pressed state', async () => {
    await setupElement({isSelected: true});
    const {button} = locators;
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveAttribute(
      'part',
      expect.stringContaining('value-box-selected')
    );
  });

  it('should apply selected class to the button', async () => {
    await setupElement({isSelected: true});
    const {button} = locators;
    await expect(button).toHaveClass('selected');
  });
});
