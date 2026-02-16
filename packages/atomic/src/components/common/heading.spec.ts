import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type HeadingProps, renderHeading as heading} from './heading';

describe('heading', () => {
  const renderHeading = async (
    props: Partial<HeadingProps>,
    children?: string
  ): Promise<HTMLElement> => {
    return renderFunctionFixture(
      html` ${heading({
        props: {...props, level: props.level ?? 1},
      })(html`${children}`)}`
    );
  };

  it('should render a heading in the document', async () => {
    const props = {level: 1};
    const element = await renderHeading(props);
    const headingElement = element.querySelector('h1');
    expect(headingElement).toBeInTheDocument();
  });

  it('should render a heading with the correct level', async () => {
    const props = {level: 2};
    const element = await renderHeading(props);
    const headingElement = element.querySelector('h2');
    expect(headingElement?.tagName.toLowerCase()).toBe('h2');
  });

  it('should render a div if level is outside the range of 1 to 6', async () => {
    const props = {level: 0};
    const element = await renderHeading(props);
    const headingElement = element.querySelector('div');
    expect(headingElement?.tagName.toLowerCase()).toBe('div');
  });

  it('should render a heading with the correct text content', async () => {
    const props = {level: 1};
    const element = await renderHeading(props, 'Test Heading');
    expect(element.textContent).toContain('Test Heading');
  });

  it('should apply additional classes', async () => {
    const props = {level: 1, class: 'test-class'};
    const element = await renderHeading(props);
    const headingElement = element.querySelector('h1');
    expect(headingElement).toHaveClass('test-class');
  });

  it('should apply part attribute', async () => {
    const props = {level: 1, part: 'heading-part'};
    const element = await renderHeading(props);
    const headingElement = element.querySelector('h1');
    expect(headingElement?.getAttribute('part')).toBe('heading-part');
  });
});
