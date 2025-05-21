import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {expect, vi, describe, it} from 'vitest';
import {renderFacetValueExclude, ExcludeProps} from './facet-value-exclude';

const setupElement = async (props: Partial<ExcludeProps> = {}) => {
  const defaultProps: ExcludeProps = {
    onClick: vi.fn(),
    ...props,
  };
  return await renderFunctionFixture(
    html`${renderFacetValueExclude({props: defaultProps})}`
  );
};

const locators = {
  get button() {
    return page.getByRole('button');
  },
  icon(element: HTMLElement) {
    return element.querySelector('atomic-icon');
  },
};

describe('renderFacetValueExclude', () => {
  it('renders the button and icon', async () => {
    const element = await setupElement();
    const {button} = locators;
    const icon = locators.icon(element);
    await expect(button).toBeInTheDocument();
    await expect(icon).toBeInTheDocument();
  });

  it('applies the correct class and part attributes', async () => {
    await setupElement({class: 'custom-class'});
    const {button} = locators;
    expect(button).toHaveAttribute('part', 'value-exclude-button');
  });

  it('sets aria-label and value attributes from props', async () => {
    await setupElement({ariaLabel: 'Exclude', text: 'foo'});
    const {button} = locators;
    expect(button).toHaveAttribute('aria-label', 'Exclude');
    expect(button).toHaveAttribute('value', 'foo');
  });

  it('calls onClick when button is clicked', async () => {
    const onClick = vi.fn();
    await setupElement({onClick});
    const {button} = locators;
    await button.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('calls onMouseEnter when mouse enters button', async () => {
    const onMouseEnter = vi.fn();
    await setupElement({onMouseEnter});
    const {button} = locators;
    button.element().dispatchEvent(new MouseEvent('mouseenter'));
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it('forwards ref if provided', async () => {
    let refElement: Element | undefined;
    const ref = (el?: Element) => {
      refElement = el;
    };
    await setupElement({ref});
    expect(refElement).not.toBeNull();
    expect(refElement?.tagName).toBe('BUTTON');
  });
});
