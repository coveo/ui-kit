import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html, nothing, TemplateResult} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {vi, expect, describe, beforeAll, it, beforeEach} from 'vitest';
import {renderCarousel, CarouselProps} from './carousel';
import {AnyBindings} from './interface/bindings';

describe('carousel', () => {
  let container: HTMLElement;
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    if (container) {
      document.body.removeChild(container);
    }
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const locators = {
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
    get indicatorContainer() {
      return page.getByRole('list', {
        name: i18n.t('carousel-indicators'),
      });
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
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCarousel({props: mergedProps})(children ?? defaultChildren)}`
    );
  };

  it('should render the carousel in the document with its children', async () => {
    const carouselElement = await renderComponent();
    const children = within(carouselElement).getAllByRole('listitem');
    expect(children.length).toBeGreaterThan(0);
  });

  it('should render nothing when no children are passed', async () => {
    const carouselElement = await renderComponent({}, nothing);
    expect(carouselElement.textContent).toBe('');
  });

  it('should render the correct number of indicators', async () => {
    const carouselElement = await renderComponent({
      numberOfPages: 5,
    });
    const indicators = within(carouselElement).getAllByRole('listitem');
    expect(indicators.length).toBe(5);
  });

  it('should render an icon inside the previous button', async () => {
    await renderComponent();

    await expect.element(locators.previousButtonIcon).toBeVisible();
    await expect
      .element(locators.previousButtonIcon)
      .toHaveAttribute('icon', expect.stringMatching(/<svg/));
  });

  it('should render an icon inside the next button', async () => {
    await renderComponent();

    await expect.element(locators.nextButtonIcon).toBeVisible();
    await expect
      .element(locators.nextButtonIcon)
      .toHaveAttribute('icon', expect.stringMatching(/<svg/));
  });

  it('should have the correct part attribute for the "previous" button', async () => {
    await renderComponent();
    const showMoreButton = await locators.previousButton.element();
    await expect
      .element(showMoreButton)
      .toHaveAttribute('part', 'previous-button');
  });

  it('should have the correct part attribute for the "next" button', async () => {
    await renderComponent();
    const showMoreButton = await locators.nextButton.element();
    await expect(showMoreButton).toHaveAttribute('part', 'next-button');
  });

  it('should have the correct part attribute for the icon', async () => {
    await renderComponent();
    await expect
      .element(locators.previousButtonIcon)
      .toHaveAttribute('part', 'previous-icon');
    await expect
      .element(locators.nextButtonIcon)
      .toHaveAttribute('part', 'next-icon');
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
});
