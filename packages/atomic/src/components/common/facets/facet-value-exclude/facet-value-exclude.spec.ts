import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type ExcludeProps,
  renderFacetValueExclude,
} from './facet-value-exclude';

const setupElement = async (props: Partial<ExcludeProps> = {}) => {
  const element = await renderFunctionFixture(
    html`${renderFacetValueExclude({
      props: {
        onClick: vi.fn(),
        ...props,
      },
    })}`
  );
  const button = element.querySelector('button');
  button!.style.visibility = 'visible';

  return {
    element,
    button,
    icon: element.querySelector('atomic-icon'),
  };
};

describe('renderFacetValueExclude', () => {
  it('renders the button and icon', async () => {
    const {button, icon} = await setupElement();
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });

  it('applies the correct part attributes', async () => {
    const {button} = await setupElement();
    expect(button).toHaveAttribute('part', 'value-exclude-button');
  });

  it('sets aria-label and value attributes from props', async () => {
    const {button} = await setupElement({ariaLabel: 'Exclude'});

    expect(button).toHaveAttribute('aria-label', 'Exclude');
  });

  it('calls onClick when button is clicked', async () => {
    const onClick = vi.fn();
    const {button} = await setupElement({onClick});
    await userEvent.click(button!);
    expect(onClick).toHaveBeenCalled();
  });
});
