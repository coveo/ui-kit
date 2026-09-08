import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SearchResultsPage} from './SearchResultsPage.js';

vi.mock('../CommerceSearchLayout/CommerceSearchLayout.js', () => ({
  CommerceSearchLayout: ({surfaceId}: {surfaceId: string}) => (
    <div data-testid="commerce-search-layout">{surfaceId}</div>
  ),
}));

vi.mock('../ProductTargeting/ProductTargeting.js', () => ({
  ProductTargeting: ({children}: {children: React.ReactNode}) => (
    <div data-testid="product-targeting">{children}</div>
  ),
}));

const defaultProps = {
  surfaceId: 'ui-commerce-search',
  onSubmit: vi.fn(),
  isStreaming: false,
  onBackToConversation: vi.fn(),
  products: [] as never[],
  onProductsChange: vi.fn(),
};

describe('SearchResultsPage', () => {
  it('renders the commerce search layout with the given surfaceId', () => {
    render(<SearchResultsPage {...defaultProps} />);

    expect(screen.getByTestId('commerce-search-layout')).toBeDefined();
    expect(screen.getByText('ui-commerce-search')).toBeDefined();
  });

  it('wraps the layout in ProductTargeting', () => {
    render(<SearchResultsPage {...defaultProps} />);

    const targeting = screen.getByTestId('product-targeting');
    expect(targeting.contains(screen.getByTestId('commerce-search-layout'))).toBe(true);
  });

  it('renders a "Back to conversation" button that calls onBackToConversation', () => {
    const onBackToConversation = vi.fn();
    render(<SearchResultsPage {...defaultProps} onBackToConversation={onBackToConversation} />);

    fireEvent.click(screen.getByRole('button', {name: 'Back to conversation'}));

    expect(onBackToConversation).toHaveBeenCalledTimes(1);
  });
});
