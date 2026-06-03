import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type FacetValueLinkProps,
  renderFacetValueLink,
} from './facet-value-link';

describe('renderFacetValueLink', () => {
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
    get subList() {
      return page.getByTestId('sub-list');
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (
    props?: Partial<FacetValueLinkProps>,
    children = html`Some Value Label`
  ) => {
    const baseProps: FacetValueLinkProps = {
      displayValue: 'Test Value',
      numberOfResults: 42,
      isSelected: false,
      i18n,
      onClick: vi.fn(),
    };
    return await renderFunctionFixture(
      html`${renderFacetValueLink({
        props: {...baseProps, ...props},
      })(children)}`
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
    await setupElement({class: 'custom-class', part: 'custom-part'});
    const {listItem, button, valueCount} = locators;
    await expect(listItem).toHaveClass('custom-class');
    await expect(button).toHaveAttribute('part', 'custom-part');
    await expect(valueCount).toHaveAttribute('part', 'value-count');
  });

  it('applies the correct part when not selected', async () => {
    await setupElement();
    const {button} = locators;
    await expect(button).toHaveAttribute('part', 'value-link');
  });

  it('applies the correct part when selected', async () => {
    await setupElement({isSelected: true});
    const {button} = locators;
    await expect(button).toHaveAttribute(
      'part',
      'value-link value-link-selected'
    );
  });

  it('calls onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    await setupElement({onClick});
    const {button} = locators;
    await button.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('renders subList if provided', async () => {
    const subList = html`<ul data-testid="sub-list">
      <li>Subitem</li>
    </ul>`;
    await setupElement({subList});
    const {subList: subListLocator} = locators;
    await expect(subListLocator).toBeInTheDocument();
    await expect(subListLocator).toHaveTextContent('Subitem');
  });

  it('applies aria attributes and pressed state', async () => {
    await setupElement({isSelected: true});
    const {button} = locators;
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies additionalPart if provided', async () => {
    await setupElement({additionalPart: 'extra-part'});
    const {button} = locators;
    await expect(button).toHaveAttribute(
      'part',
      expect.stringContaining('extra-part')
    );
  });

  it('renders the aria-label attribute', async () => {
    await setupElement();
    const {button} = locators;
    await expect(button).toHaveAttribute(
      'aria-label',
      'Inclusion filter on Test Value; 42 results'
    );
  });
});
