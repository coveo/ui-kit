import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {noItemsGuard} from './guard';

describe('#noItemsGuard', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${noItemsGuard(
        {
          firstSearchExecuted: true,
          isLoading: false,
          hasResults: false,
          ...overrides,
        },
        () => html`<div data-testid="no-items">No items found</div>`
      )}`
    );

    return {
      noItems: element.querySelector('div[data-testid="no-items"]'),
    };
  };

  it('should render the content when firstSearchExecuted is true, isLoading is false, and hasResults is false', async () => {
    const {noItems} = await renderComponent();

    expect(noItems).toBeInTheDocument();
    expect(noItems).toHaveTextContent('No items found');
  });

  it('should not render the content when firstSearchExecuted is false', async () => {
    const {noItems} = await renderComponent({firstSearchExecuted: false});

    expect(noItems).not.toBeInTheDocument();
  });

  it('should not render the content when isLoading is true', async () => {
    const {noItems} = await renderComponent({isLoading: true});

    expect(noItems).not.toBeInTheDocument();
  });

  it('should not render the content when hasResults is true', async () => {
    const {noItems} = await renderComponent({hasResults: true});

    expect(noItems).not.toBeInTheDocument();
  });
});
