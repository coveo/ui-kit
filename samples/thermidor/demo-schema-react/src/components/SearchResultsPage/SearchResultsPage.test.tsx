import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {RoutedInterface} from '@coveo/thermidor';
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

const decomposedInterface = {
  useCase: 'decomposedCommerceSearch',
  surfaceType: 'commerceSearch',
  surfaceId: 'ui-commerce-search',
} as RoutedInterface;

const defaultProps = {
  onSubmit: vi.fn(),
  isStreaming: false,
  routedInterface: decomposedInterface,
  onBackToConversation: vi.fn(),
  products: [],
  onProductsChange: vi.fn(),
};

describe('SearchResultsPage', () => {
  it('renders the decomposed commerce layout for a decomposedCommerceSearch interface', () => {
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

  it('renders nothing when routedInterface is null', () => {
    const {container} = render(
      <SearchResultsPage {...defaultProps} routedInterface={null as unknown as RoutedInterface} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for a non-decomposed (hydrated) interface', () => {
    const {container} = render(
      <SearchResultsPage
        {...defaultProps}
        routedInterface={{useCase: 'search', interface: {id: 'mock'}} as unknown as RoutedInterface}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
