import {html, render} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {carousel, CarouselProps} from './carousel';

describe('carousel', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderCarousel = (
    props: Partial<CarouselProps>,
    children?: string
  ): HTMLElement => {
    render(
      html` ${carousel({
        props: {
          ...props,
          previousPage: props.previousPage ?? jest.fn(),
          nextPage: props.nextPage ?? jest.fn(),
          numberOfPages: props.numberOfPages ?? 3,
          currentPage: props.currentPage ?? 0,
        },
      })(html`${children}`)}`,
      container
    );
    return container.querySelector('.carousel') as HTMLElement;
  };

  it('should render the carousel in the document', () => {
    const props = {};
    const carouselElement = renderCarousel(props);
    expect(carouselElement).toBeInTheDocument();
  });

  it('should render the correct number of indicators', () => {
    const props = {numberOfPages: 5};
    const carouselElement = renderCarousel(props);
    const indicators = within(carouselElement).getAllByRole('listitem');
    expect(indicators.length).toBe(5);
  });

  it('should call previousPage when the previous button is clicked', () => {
    const previousPage = jest.fn();
    const props = {previousPage};
    const carouselElement = renderCarousel(props);
    const previousButton = carouselElement.shadowRoot?.querySelector(
      '[part="previous-button"]'
    ) as HTMLElement;
    previousButton.click();
    expect(previousPage).toHaveBeenCalled();
  });

  it('should call nextPage when the next button is clicked', () => {
    const nextPage = jest.fn();
    const props = {nextPage};
    const carouselElement = renderCarousel(props);
    const nextButton = carouselElement.shadowRoot?.querySelector(
      '[part="next-button"]'
    ) as HTMLElement;
    nextButton.click();
    expect(nextPage).toHaveBeenCalled();
  });

  it('should apply additional classes', () => {
    const props = {class: 'test-class'};
    const carouselElement = renderCarousel(props);
    expect(carouselElement).toHaveClass('test-class');
  });

  it('should apply part attribute', () => {
    const props = {part: 'carousel-part'};
    const carouselElement = renderCarousel(props);
    expect(carouselElement.getAttribute('part')).toBe('carousel-part');
  });

  it('should render the previous button with an atomic-icon component', () => {
    const props = {previousPage: jest.fn()};
    const carouselElement = renderCarousel(props);
    const previousButton = carouselElement.shadowRoot?.querySelector(
      '[part="previous-button"]'
    ) as HTMLElement;
    const icon = previousButton.querySelector('atomic-icon') as HTMLElement;
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('icon')).toContain('arrow-right.svg');
    expect(icon.classList).toContain('rotate-180');
  });

  it('should render the next button with an atomic-icon component', () => {
    const props = {nextPage: jest.fn()};
    const carouselElement = renderCarousel(props);
    const nextButton = carouselElement.shadowRoot?.querySelector(
      '[part="next-button"]'
    ) as HTMLElement;
    const icon = nextButton.querySelector('atomic-icon') as HTMLElement;
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('icon')).toContain('arrow-right.svg');
    expect(icon.classList).not.toContain('rotate-180');
  });
});
