import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type FacetShowMoreProps,
  renderFacetShowMoreLess,
} from './facet-show-more-less';

describe('#renderFacetShowMoreLess', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const locators = {
    get showMoreButton() {
      return page.getByRole('button', {
        name: 'Show more values for the test facet',
      });
    },
    get showMoreIcon() {
      return locators.showMoreButton.element().querySelector('atomic-icon');
    },
    get showLessButton() {
      return page.getByRole('button', {
        name: 'Show less values for the test facet',
      });
    },
    get showLessIcon() {
      return locators.showLessButton.element().querySelector('atomic-icon');
    },
  };

  const renderComponent = (props: Partial<FacetShowMoreProps> = {}) => {
    const defaultProps = {
      i18n,
      label: 'test',
      canShowLessValues: false,
      canShowMoreValues: false,
      onShowMore: vi.fn(),
      onShowLess: vi.fn(),
      showMoreRef: vi.fn(),
      showLessRef: vi.fn(),
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderFacetShowMoreLess({props: mergedProps})}`
    );
  };

  it('renders nothing when both canShowLessValues and canShowMoreValues are false', async () => {
    const container = await renderComponent();
    expect(container.textContent).toBe('');
  });

  it('renders only the "show more" button when canShowMoreValues is true', async () => {
    await renderComponent({canShowMoreValues: true});
    await expect.element(locators.showMoreButton).toBeInTheDocument();
    await expect.element(locators.showLessButton).not.toBeInTheDocument();
  });

  it('renders only the "show less" button when canShowLessValues is true', async () => {
    await renderComponent({canShowLessValues: true});
    await expect.element(locators.showLessButton).toBeInTheDocument();
    await expect.element(locators.showMoreButton).not.toBeInTheDocument();
  });

  it('renders both "show more" and "show less" buttons when both are true', async () => {
    await renderComponent({
      canShowMoreValues: true,
      canShowLessValues: true,
    });
    await expect.element(locators.showLessButton).toBeInTheDocument();
    await expect.element(locators.showMoreButton).toBeInTheDocument();
  });

  it('renders an icon inside the "show more" button', async () => {
    await renderComponent({canShowMoreValues: true});
    await expect.element(locators.showMoreIcon).toBeVisible();
    await expect
      .element(locators.showMoreIcon)
      .toHaveAttribute('icon', expect.stringMatching(/<svg/));
  });

  it('renders an icon inside the "show less" button', async () => {
    await renderComponent({canShowLessValues: true});
    await expect.element(locators.showLessIcon).toBeVisible();
    await expect
      .element(locators.showLessIcon)
      .toHaveAttribute('icon', expect.stringMatching(/<svg/));
  });

  it('should have the correct part attribute for the "show more" button', async () => {
    await renderComponent({canShowMoreValues: true});
    const showMoreButton = await locators.showMoreButton.element();
    await expect.element(showMoreButton).toHaveAttribute('part', 'show-more');
  });

  it('should have the correct part attribute for the "show less" button', async () => {
    await renderComponent({canShowLessValues: true});
    const showLessButton = await locators.showLessButton.element();
    await expect.element(showLessButton).toHaveAttribute('part', 'show-less');
  });

  it('should have the correct part attribute for the icon', async () => {
    await renderComponent({canShowMoreValues: true});
    await renderComponent({canShowLessValues: true});
    await expect
      .element(locators.showLessIcon)
      .toHaveAttribute('part', 'show-more-less-icon');
    await expect
      .element(locators.showMoreIcon)
      .toHaveAttribute('part', 'show-more-less-icon');
  });

  it('calls #onShowMore when the "show more" button is clicked', async () => {
    const onShowMoreMock = vi.fn();
    await renderComponent({
      canShowMoreValues: true,
      onShowMore: onShowMoreMock,
    });

    await locators.showMoreButton.click();
    expect(onShowMoreMock).toHaveBeenCalled();
  });

  it('calls #onShowLess when the "show less" button is clicked', async () => {
    const onShowLessMock = vi.fn();
    await renderComponent({
      canShowLessValues: true,
      onShowLess: onShowLessMock,
    });
    await locators.showLessButton.click();
    expect(onShowLessMock).toHaveBeenCalled();
  });

  it('calls #showMoreRef with the "show more" button element', async () => {
    const showMoreRefMock = vi.fn();
    await renderComponent({
      canShowMoreValues: true,
      showMoreRef: showMoreRefMock,
    });
    expect(showMoreRefMock).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('calls showLessRef with the "show less" button element', async () => {
    const showLessRefMock = vi.fn();
    await renderComponent({
      canShowLessValues: true,
      showLessRef: showLessRefMock,
    });
    expect(showLessRefMock).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
