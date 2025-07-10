import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderMagnifyingGlass} from './magnifying-glass';

describe('#renderMagnifyingGlass', () => {
  const renderComponent = async () => {
    const element = await renderFunctionFixture(
      html`${renderMagnifyingGlass()}`
    );

    return {
      icon: element.querySelector('atomic-icon'),
    };
  };

  it('should render an atomic-icon element', async () => {
    const {icon} = await renderComponent();

    expect(icon).toBeInTheDocument();
    expect(icon?.tagName.toLowerCase()).toBe('atomic-icon');
  });

  it('should have the correct part attribute', async () => {
    const {icon} = await renderComponent();

    expect(icon).toHaveAttribute('part', 'icon');
  });

  it('should have the correct icon attribute', async () => {
    const {icon} = await renderComponent();

    const iconValue = icon?.getAttribute('icon');
    expect(iconValue).toBeTruthy();
    expect(typeof iconValue).toBe('string');
  });
});
