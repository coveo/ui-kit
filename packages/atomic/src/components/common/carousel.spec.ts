import {html, render} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {vi} from 'vitest';
import {carousel, CarouselProps} from './carousel';
import {AnyBindings} from './interface/bindings';

describe('carousel', () => {
  let container: HTMLElement;

  beforeEach(() => {
    if (container) {
      document.body.removeChild(container);
    }
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const renderCarousel = (
    props: Partial<CarouselProps>,
    children?: string
  ): HTMLElement => {
    render(
      html` ${carousel({
        props: {
          ...props,
          bindings: {
            i18n: {
              t: (key: string) => key,
            },
          } as AnyBindings,
          previousPage: props.previousPage ?? vi.fn(),
          nextPage: props.nextPage ?? vi.fn(),
          numberOfPages: props.numberOfPages ?? 3,
          currentPage: props.currentPage ?? 0,
        },
      })(html`${children}`)}`,
      container
    );
    return container as HTMLElement;
  };

  it('should render the carousel in the document', () => {
    const props = {};
    const carouselElement = renderCarousel(props);
    expect(carouselElement).toBeInTheDocument();
  });

  it('should render the correct number of indicators', () => {
    const props = {numberOfPages: 5};
    const carouselElement = renderCarousel(props);
    console.log(carouselElement);
    const indicators = within(carouselElement).getAllByRole('listitem');
    expect(indicators.length).toBe(5);
  });

  it('should call previousPage when the previous button is clicked', () => {
    const previousPage = vi.fn();
    const props = {previousPage};
    const carouselElement = renderCarousel(props);
    const previousButton = carouselElement.querySelector(
      '[part="previous-button"]'
    ) as HTMLElement;
    previousButton.click();
    expect(previousPage).toHaveBeenCalled();
  });

  it('should call nextPage when the next button is clicked', () => {
    const nextPage = vi.fn();
    const props = {nextPage};
    const carouselElement = renderCarousel(props);
    const nextButton = carouselElement.querySelector(
      '[part="next-button"]'
    ) as HTMLElement;
    nextButton.click();
    expect(nextPage).toHaveBeenCalled();
  });
});
