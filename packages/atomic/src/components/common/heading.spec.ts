import {within} from '@storybook/test';
import {html, render} from 'lit';
import {heading, HeadingProps} from './heading';

describe('heading', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderHeading = (
    props: Partial<HeadingProps>,
    children?: string
  ): HTMLElement => {
    render(
      html`${heading(
        {
          ...props,
          level: props.level ?? 1,
        },
        html`${children}`
      )}`,
      container
    );
    return within(container).getByRole(
      props.level && props.level > 0 && props.level <= 6 ? 'heading' : 'generic'
    ) as HTMLElement;
  };

  it('should render a heading in the document', () => {
    const props = {level: 1};
    const headingElement = renderHeading(props);
    expect(headingElement).toBeInTheDocument();
  });

  it('should render a heading with the correct level', () => {
    const props = {level: 2};
    const headingElement = renderHeading(props);
    expect(headingElement.tagName.toLowerCase()).toBe('h2');
  });

  it('should render a div if level is outside the range of 1 to 6', () => {
    const props = {level: 0};
    const headingElement = renderHeading(props);
    expect(headingElement.tagName.toLowerCase()).toBe('div');
  });

  it('should render a heading with the correct text content', () => {
    const props = {level: 1};
    const headingElement = renderHeading(props, 'Test Heading');
    expect(headingElement.textContent).toContain('Test Heading');
  });

  it('should apply additional classes', () => {
    const props = {level: 1, class: 'test-class'};
    const headingElement = renderHeading(props);
    expect(headingElement).toHaveClass('test-class');
  });

  it('should apply part attribute', () => {
    const props = {level: 1, part: 'heading-part'};
    const headingElement = renderHeading(props);
    expect(headingElement.getAttribute('part')).toBe('heading-part');
  });
});
