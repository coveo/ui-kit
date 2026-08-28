import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ProductTargeting, type ProductTargetingProps} from './ProductTargeting.js';
import type {TargetedProduct} from '../../context/targeting.js';

vi.mock('../PromptInput/PromptInput.js', () => ({
  PromptInput: ({onSubmit, disabled}: {onSubmit: (prompt: string) => void; disabled?: boolean}) => (
    <input
      data-testid="mock-prompt-input"
      disabled={disabled}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSubmit((e.target as HTMLInputElement).value);
        }
      }}
    />
  ),
}));

const defaultProps: ProductTargetingProps = {
  products: [],
  onProductsChange: vi.fn(),
  onSubmit: vi.fn(),
  isStreaming: false,
  children: <div data-testid="children">Content</div>,
};

function renderComponent(overrides: Partial<ProductTargetingProps> = {}) {
  const props = {...defaultProps, ...overrides};
  return render(<ProductTargeting {...props} />);
}

describe('ProductTargeting', () => {
  it('renders toolbar with hint text "Attach product context" when no products attached', () => {
    renderComponent();
    expect(screen.getByText('Attach product context')).toBeDefined();
  });

  it('toggling attach button changes hint text to "Select products to attach"', () => {
    renderComponent();

    const attachButton = screen.getByRole('button', {name: /attach product context/i});
    fireEvent.click(attachButton);

    expect(screen.getByText('Select products to attach')).toBeDefined();
  });

  it('adding products shows pills (thumbnail images)', () => {
    const products: TargetedProduct[] = [
      {id: '1', name: 'Product A', thumbnail: 'https://example.com/a.png'},
      {id: '2', name: 'Product B', thumbnail: 'https://example.com/b.png'},
    ];
    renderComponent({products});

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute('alt')).toBe('Product A');
    expect(images[1].getAttribute('alt')).toBe('Product B');
  });

  it('removing pill (clicking it) calls onProductsChange with the product removed', () => {
    const onProductsChange = vi.fn();
    const products: TargetedProduct[] = [
      {id: '1', name: 'Product A', thumbnail: 'https://example.com/a.png'},
      {id: '2', name: 'Product B', thumbnail: 'https://example.com/b.png'},
    ];
    renderComponent({products, onProductsChange});

    const pill = screen.getByRole('button', {name: 'Remove Product A'});
    fireEvent.click(pill);

    expect(onProductsChange).toHaveBeenCalledWith([
      {id: '2', name: 'Product B', thumbnail: 'https://example.com/b.png'},
    ]);
  });

  it('clear button removes all products (calls onProductsChange([]))', () => {
    const onProductsChange = vi.fn();
    const products: TargetedProduct[] = [
      {id: '1', name: 'Product A', thumbnail: 'https://example.com/a.png'},
    ];
    renderComponent({products, onProductsChange});

    const clearButton = screen.getByRole('button', {name: /clear/i});
    fireEvent.click(clearButton);

    expect(onProductsChange).toHaveBeenCalledWith([]);
  });

  it('submit appends context string when products are attached', () => {
    const onSubmit = vi.fn();
    const products: TargetedProduct[] = [
      {id: '1', name: 'Widget X'},
      {id: '2', name: 'Gadget Y'},
    ];
    renderComponent({products, onSubmit});

    const input = screen.getByTestId('mock-prompt-input');
    fireEvent.change(input, {target: {value: 'Tell me about these'}});
    fireEvent.keyDown(input, {key: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith(
      'Tell me about these [ADDITIONAL CONTEXT: Widget X, Gadget Y]'
    );
  });

  it('submit without products passes prompt as-is', () => {
    const onSubmit = vi.fn();
    renderComponent({products: [], onSubmit});

    const input = screen.getByTestId('mock-prompt-input');
    fireEvent.change(input, {target: {value: 'Hello world'}});
    fireEvent.keyDown(input, {key: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('Hello world');
  });

  it('auto-exits targeting on streaming (when isStreaming changes to true)', () => {
    const {rerender} = render(<ProductTargeting {...defaultProps} isStreaming={false} />);

    const attachButton = screen.getByRole('button', {name: /attach product context/i});
    fireEvent.click(attachButton);
    expect(screen.queryByText('Select products to attach')).not.toBeNull();

    rerender(<ProductTargeting {...defaultProps} isStreaming={true} />);

    expect(screen.queryByText('Select products to attach')).toBeNull();
  });

  it('attach button is disabled when streaming', () => {
    renderComponent({isStreaming: true});

    const attachButton = screen.getByRole('button', {name: /attach product context/i});
    expect((attachButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('pills are not removable when streaming (click does nothing)', () => {
    const onProductsChange = vi.fn();
    const products: TargetedProduct[] = [
      {id: '1', name: 'Product A', thumbnail: 'https://example.com/a.png'},
    ];
    renderComponent({products, onProductsChange, isStreaming: true});

    const pill = screen.getByRole('button', {name: 'Remove Product A'});
    fireEvent.click(pill);

    expect(onProductsChange).not.toHaveBeenCalled();
  });
});
