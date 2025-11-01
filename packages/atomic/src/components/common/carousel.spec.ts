import {html, nothing, type TemplateResult} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type CarouselProps, renderCarousel} from './carousel';
import type {AnyBindings} from './interface/bindings';

describe('carousel', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const locators = {
    get carousel() {
      return page.getByRole('region', {
        name: 'carousel',
      });
    },
    get previousButton() {
      return page.getByRole('button', {
        name: 'previous',
      });
    },
    get previousButtonIcon() {
      return locators.previousButton.element().querySelector('atomic-icon');
    },
    get nextButton() {
      return page.getByRole('button', {
        name: 'next',
      });
    },
    get nextButtonIcon() {
      return locators.nextButton.element().querySelector('atomic-icon');
    },
    get indicator() {
      return page.getByRole('listitem');
    },
  };

  const renderComponent = (
    props: Partial<CarouselProps> = {},
    children?: TemplateResult | typeof nothing
  ) => {
    const defaultChildren = html`<div class="flex justify-center gap-4">
      <div class="rounded border p-2">product 1</div>
      <div class="rounded border p-2">product 2</div>
      <div class="rounded border p-2">product 3</div>
    </div>`;

    const defaultProps = {
      bindings: {
        i18n: i18n,
      } as AnyBindings,
      previousPage: vi.fn(),
      nextPage: vi.fn(),
      numberOfPages: 3,
      currentPage: 0,
      ariaLabel: 'carousel',
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCarousel({props: mergedProps})(children ?? defaultChildren)}`
    );
  };

  it('should render the carousel in the document with its children', async () => {
    await renderComponent();
    const indicators = locators.indicator.all();
    expect(indicators).length.greaterThan(0);
  });

  it('should render nothing when no children are passed', async () => {
    const carouselElement = await renderComponent({}, nothing);
    expect(carouselElement.textContent).toBe('');
  });

  it('should render the correct number of indicators', async () => {
    await renderComponent({numberOfPages: 5});
    const indicators = locators.indicator.all();
    expect(indicators).toHaveLength(5);
  });

  it('should render an icon inside the previous button', async () => {
    await renderComponent();

    await expect(locators.previousButtonIcon).toBeVisible();
    expect(locators.previousButtonIcon).toHaveAttribute(
      'icon',
      expect.stringMatching(/<svg/)
    );
  });

  it('should render an icon inside the next button', async () => {
    await renderComponent();

    expect(locators.nextButtonIcon).toBeVisible();
    expect(locators.nextButtonIcon).toHaveAttribute(
      'icon',
      expect.stringMatching(/<svg/)
    );
  });

  it('should have the proper aria-label for the carousel container', async () => {
    await renderComponent();
    expect(locators.carousel).toHaveAttribute('aria-label', 'carousel');
  });

  it('should have the correct part attribute for the "previous" button', async () => {
    await renderComponent();
    const showMoreButton = locators.previousButton;
    expect(showMoreButton).toHaveAttribute('part', 'previous-button');
  });

  it('should have the correct part attribute for the "next" button', async () => {
    await renderComponent();
    const showMoreButton = locators.nextButton;
    expect(showMoreButton).toHaveAttribute('part', 'next-button');
  });

  it('should have the correct part attribute for the icon', async () => {
    await renderComponent();
    expect(locators.previousButtonIcon).toHaveAttribute(
      'part',
      'previous-icon'
    );
    expect(locators.nextButtonIcon).toHaveAttribute('part', 'next-icon');
  });

  it('should call #previousPage when the previous button is clicked', async () => {
    const previousPageMock = vi.fn();

    const carouselElement = await renderComponent({
      previousPage: previousPageMock,
    });
    const previousButton = carouselElement.querySelector(
      '[part="previous-button"]'
    ) as HTMLElement;
    previousButton.click();
    expect(previousPageMock).toHaveBeenCalled();
  });

  it('should call #nextPage when the next button is clicked', async () => {
    const nextPageMock = vi.fn();
    const carouselElement = await renderComponent({
      nextPage: nextPageMock,
    });
    const nextButton = carouselElement.querySelector(
      '[part="next-button"]'
    ) as HTMLElement;
    nextButton.click();
    expect(nextPageMock).toHaveBeenCalled();
  });

  it('should not render buttons or indicators when there is only one page', async () => {
    const carouselElement = await renderComponent({
      numberOfPages: 1,
    });
    const previousButton = carouselElement.querySelector(
      '[part="previous-button"]'
    );
    const nextButton = carouselElement.querySelector('[part="next-button"]');
    const indicators = carouselElement.querySelector('[part="indicators"]');

    expect(previousButton).toBeNull();
    expect(nextButton).toBeNull();
    expect(indicators).toBeNull();
  });

  it('should mark the current indicator as active', async () => {
    const numberOfPages = 3;
    const currentPage = 1;
    await renderComponent({numberOfPages, currentPage});
    const listItem = (page: number) => locators.indicator.nth(page);

    expect(listItem(currentPage)).toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
  });

  it('should not mark other pages active', async () => {
    const numberOfPages = 3;
    const currentPage = 1;
    await renderComponent({numberOfPages, currentPage});
    const listItem = (page: number) => locators.indicator.nth(page);

    expect(listItem(0)).not.toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
    expect(listItem(2)).not.toHaveAttribute(
      'part',
      'indicator active-indicator'
    );
  });
});
