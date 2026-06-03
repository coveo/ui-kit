import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type GroupProps, renderFieldsetGroup} from './fieldset-group';

describe('renderFieldsetGroup', () => {
  const defaultProps: GroupProps = {
    label: 'Test Group',
  };

  const renderComponent = (
    props: Partial<GroupProps> = {},
    children = html`<div>Child Content</div>`
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return renderFunctionFixture(
      html`${renderFieldsetGroup({props: mergedProps})(children)}`
    );
  };

  it('renders a fieldset element', async () => {
    const container = await renderComponent();
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeInTheDocument();
    expect(fieldset).toHaveClass('contents');
  });

  it('renders a legend element with the correct label', async () => {
    await renderComponent();
    const legend = page.getByText('Test Group');
    expect(legend).toBeInTheDocument();
  });

  it('renders the children inside the fieldset', async () => {
    await renderComponent({}, html`<div>Custom Child</div>`);
    const child = page.getByText('Custom Child');
    expect(child).toBeInTheDocument();
  });

  it('updates the legend label when the label prop changes', async () => {
    await renderComponent({label: 'Updated Group'});
    const legend = page.getByText('Updated Group');
    expect(legend).toBeInTheDocument();
  });

  it('renders multiple children inside the fieldset', async () => {
    await renderComponent(
      {},
      html`
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      `
    );
    expect(page.getByTestId('child-1')).toBeInTheDocument();
    expect(page.getByTestId('child-2')).toBeInTheDocument();
  });
});
