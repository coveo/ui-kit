import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type FacetHeaderProps, renderFacetHeader} from './facet-header';

describe('#renderFacetHeader', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const locators = {
    get clearButton() {
      return page.getByRole('button', {name: 'Clear 3 filters'});
    },
    get clearButtonIcon() {
      return locators.clearButton.element().querySelector('atomic-icon');
    },
    get collapseButton() {
      return page.getByRole('button', {name: 'Collapse the Test Facet facet'});
    },
    get collapseButtonIcon() {
      return locators.collapseButton.element().querySelector('atomic-icon');
    },
    get expandButton() {
      return page.getByRole('button', {name: 'Expand the Test Facet facet'});
    },
    get expandButtonIcon() {
      return locators.expandButton.element().querySelector('atomic-icon');
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (props: Partial<FacetHeaderProps> = {}) => {
    const defaultProps: FacetHeaderProps = {
      i18n: i18n,
      label: 'Test Facet',
      numberOfActiveValues: 3,
      isCollapsed: false,
      headingLevel: 2,
      onToggleCollapse: vi.fn(),
      onClearFilters: vi.fn(),
      headerRef: vi.fn(),
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderFacetHeader({props: mergedProps})}`
    );
  };

  it('renders the clear button with the correct aria label attribute', async () => {
    await renderComponent();
    await expect.element(locators.clearButton).toBeInTheDocument();
    await expect
      .element(locators.clearButton)
      .toHaveAttribute(
        'aria-label',
        'Clear 3 filters for the Test Facet facet'
      );
  });

  it('renders the label button with the correct aria label attribute', async () => {
    await renderComponent();
    await expect.element(locators.collapseButton).toBeInTheDocument();
    await expect
      .element(locators.collapseButton)
      .toHaveAttribute('aria-label', 'Collapse the Test Facet facet');
  });

  it('renders the label button with aria expanded set to true', async () => {
    await renderComponent();
    await expect.element(locators.collapseButton).toBeInTheDocument();
    await expect
      .element(locators.collapseButton)
      .toHaveAttribute('aria-expanded', 'true');
  });

  it('renders the label button with aria expanded set to false', async () => {
    await renderComponent({isCollapsed: true});
    await expect.element(locators.expandButton).toBeInTheDocument();
    await expect
      .element(locators.expandButton)
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('renders the expand icon when the facet is collapsed', async () => {
    await renderComponent({isCollapsed: true});
    await expect.element(locators.expandButtonIcon).toBeInTheDocument();
    expect(locators.expandButtonIcon?.getAttribute('icon')).toMatchSnapshot();
  });

  it('renders the collapse icon when the facet is expanded', async () => {
    await renderComponent({isCollapsed: false});
    await expect.element(locators.collapseButtonIcon).toBeInTheDocument();
    expect(locators.collapseButtonIcon?.getAttribute('icon')).toMatchSnapshot();
  });

  it('renders the collapse filters button when there are active values', async () => {
    await renderComponent();
    await expect.element(locators.collapseButton).toBeInTheDocument();
  });

  it('calls #onToggleCollapse when the label button is clicked', async () => {
    const onToggleCollapseMock = vi.fn();
    await renderComponent({
      onToggleCollapse: onToggleCollapseMock,
    });
    locators.collapseButton.element().dispatchEvent(new Event('click'));
    expect(onToggleCollapseMock).toHaveBeenCalled();
  });

  it('should have the correct part attribute on the label button', async () => {
    await renderComponent();
    await expect
      .element(locators.collapseButton)
      .toHaveAttribute('part', 'label-button');
  });

  it('should have the correct part attribute on the label button icon', async () => {
    await renderComponent();
    await expect
      .element(locators.collapseButtonIcon)
      .toHaveAttribute('part', 'label-button-icon');
  });

  it('should have the correct part attribute on the clear button', async () => {
    await renderComponent();
    await expect
      .element(locators.clearButton)
      .toHaveAttribute('part', 'clear-button');
  });

  it('should have the correct part attribute on the clear button icon', async () => {
    await renderComponent();
    await expect
      .element(locators.clearButtonIcon)
      .toHaveAttribute('part', 'clear-button-icon');
  });

  it('does not render the clear filters button when there are no active values', async () => {
    await renderComponent({numberOfActiveValues: 0});
    await expect.element(locators.clearButton).not.toBeInTheDocument();
  });

  it('calls onClearFilters when the clear filters button is clicked', async () => {
    const onClearFiltersMock = vi.fn();
    await renderComponent({
      onClearFilters: onClearFiltersMock,
    });
    await locators.clearButton.element().dispatchEvent(new Event('click'));
    expect(onClearFiltersMock).toHaveBeenCalled();
  });

  it('renders the heading with the correct level and label', async () => {
    await renderComponent();
    const heading = page.getByText('Test Facet');
    await expect.element(heading).toBeInTheDocument();
    expect(heading.element().tagName.toLowerCase()).toBe('h2');
  });

  it('calls headerRef with the button element', async () => {
    const headerRefMock = vi.fn();
    await renderComponent({headerRef: headerRefMock});
    expect(headerRefMock).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
