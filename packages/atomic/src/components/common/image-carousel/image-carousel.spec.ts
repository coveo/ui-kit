import {html, nothing, type TemplateResult} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {AnyBindings} from '../interface/bindings';
import {type CarouselProps, renderImageCarousel} from './image-carousel';

describe('image-carousel', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const locators = {
    get previousButton() {
      return page.getByRole('button', {name: 'previous'});
    },
    get previousButtonIcon() {
      return locators.previousButton.element().querySelector('atomic-icon');
    },
    get nextButton() {
      return page.getByRole('button', {name: 'next'});
    },
    get nextButtonIcon() {
      return locators.nextButton.element().querySelector('atomic-icon');
    },
  };

  const renderComponent = (
    props: Partial<CarouselProps> = {},
    children?: TemplateResult | typeof nothing
  ) => {
    const defaultChildren = html`<div class="flex justify-center gap-4">
      <div class="rounded border p-2">image 1</div>
      <div class="rounded border p-2">image 2</div>
      <div class="rounded border p-2">image 3</div>
      <div class="rounded border p-2">image 4</div>
      <div class="rounded border p-2">image 5</div>
    </div>`;

    const defaultProps = {
      bindings: {i18n} as AnyBindings,
      previousImage: vi.fn(),
      nextImage: vi.fn(),
      navigateToImage: vi.fn(),
      numberOfImages: 3,
      currentImage: 0,
    };
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderImageCarousel({props: mergedProps})(children ?? defaultChildren)}`
    );
  };

  it('should render the carousel with its children', async () => {
    const wrapper = await renderComponent();
    expect(wrapper.textContent).toContain('image 1');
    expect(wrapper.textContent).toContain('image 2');
    expect(wrapper.textContent).toContain('image 3');
  });

  it('should render nothing when no children are passed', async () => {
    const wrapper = await renderComponent({}, nothing);
    expect(wrapper.textContent).toBe('');
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

  it('should have the correct part attribute for the previous button', async () => {
    await renderComponent();
    const prevBtn = locators.previousButton;
    expect(prevBtn).toHaveAttribute('part', 'previous-button');
  });

  it('should have the correct part attribute for the next button', async () => {
    await renderComponent();
    const nextBtn = locators.nextButton;
    expect(nextBtn).toHaveAttribute('part', 'next-button');
  });

  it('should have the correct part attribute for the icons', async () => {
    await renderComponent();
    expect(locators.previousButtonIcon).toHaveAttribute(
      'part',
      'previous-icon'
    );
    expect(locators.nextButtonIcon).toHaveAttribute('part', 'next-icon');
  });

  it('should call #previousImage when the previous button is clicked', async () => {
    const previousImageMock = vi.fn();
    const wrapper = await renderComponent({previousImage: previousImageMock});
    const prevBtn = wrapper.querySelector(
      '[part="previous-button"]'
    ) as HTMLElement;
    prevBtn.click();
    expect(previousImageMock).toHaveBeenCalled();
  });

  it('should call #nextImage when the next button is clicked', async () => {
    const nextImageMock = vi.fn();
    const wrapper = await renderComponent({nextImage: nextImageMock});
    const nextBtn = wrapper.querySelector(
      '[part="next-button"]'
    ) as HTMLElement;
    nextBtn.click();
    expect(nextImageMock).toHaveBeenCalled();
  });
});
