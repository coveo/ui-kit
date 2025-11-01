import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderCarouselIndicator} from './image-carousel-indicators';

describe('image-carousel-indicators', () => {
  const defaultProps = {
    numberOfImages: 5,
    currentImage: 2,
    navigateToImage: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderCarouselIndicator({props: mergedProps})}`
    );
  };

  const locators = {
    get list() {
      return page.getByRole('list').element() as HTMLElement;
    },
    get indicators() {
      return page
        .getByRole('listitem', {includeHidden: true})
        .all()
        .map((locator) => locator.element() as HTMLElement);
    },
    indicatorAt(idx: number) {
      return locators.indicators[idx];
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a list with part="indicators"', async () => {
    await renderComponent();
    const list = locators.list;
    expect(list).toBeInstanceOf(HTMLElement);
    expect(list?.tagName.toLowerCase()).toBe('ul');
  });

  it('should render the correct number of indicators', async () => {
    const numberOfImages = 7;
    await renderComponent({numberOfImages});
    expect(locators.indicators.length).toBe(numberOfImages);
  });

  it('should mark the current indicator as active', async () => {
    const currentImage = 3;
    await renderComponent({currentImage});
    expect(locators.indicatorAt(currentImage).getAttribute('part')).toContain(
      'active-indicator'
    );
  });

  it('should not mark other indicators as active', async () => {
    const currentImage = 1;
    await renderComponent({currentImage});
    locators.indicators.forEach((el: HTMLElement, idx: number) => {
      if (idx !== currentImage) {
        expect(el.getAttribute('part')).not.toContain('active-indicator');
      }
    });
  });

  it('should call #navigateToImage with the correct index when an indicator is clicked', async () => {
    await renderComponent();
    const targetIndex = 4;
    locators.indicatorAt(targetIndex).click();
    expect(defaultProps.navigateToImage).toHaveBeenCalledWith(targetIndex);
  });

  describe('when indicators are outside the visible range', () => {
    const numberOfImages = 7;
    const currentImage = 3;
    const maxImagesBeforeAndAfter = 2;

    beforeEach(async () => {
      await renderComponent({
        numberOfImages,
        currentImage,
        maxImagesBeforeAndAfter,
      });
    });

    it('should apply hidden/opacity classes to indicators outside the visible range', () => {
      locators.indicators.forEach((el: HTMLElement, idx: number) => {
        const classList = el.className;
        if (
          idx < currentImage - maxImagesBeforeAndAfter ||
          idx > currentImage + maxImagesBeforeAndAfter
        ) {
          expect(classList).toMatch(/hidden|opacity-0/);
        } else {
          expect(classList).not.toMatch(/hidden|opacity-0/);
        }
      });
    });

    it('should apply scale-75 to first and last displayed indicators', () => {
      const firstDisplayedIdx = Math.max(
        0,
        currentImage - maxImagesBeforeAndAfter
      );
      const lastDisplayedIdx = Math.min(
        currentImage + maxImagesBeforeAndAfter,
        numberOfImages - 1
      );
      expect(locators.indicatorAt(firstDisplayedIdx).className).toMatch(
        /scale-75/
      );
      expect(locators.indicatorAt(lastDisplayedIdx).className).toMatch(
        /scale-75/
      );
    });
  });
});
