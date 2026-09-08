import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {UserPromptBubble} from './UserPromptBubble.js';

describe('UserPromptBubble', () => {
  it('displays the prompt text without context', () => {
    render(<UserPromptBubble prompt="What are the best running shoes?" />);
    expect(screen.getByText('What are the best running shoes?')).toBeDefined();
    expect(screen.queryByText('Products:')).toBeNull();
  });

  it('applies the bubble class for right-alignment styling', () => {
    const {container} = render(<UserPromptBubble prompt="hello" />);
    const bubble = container.firstElementChild as HTMLElement;
    expect(bubble.className).toContain('bubble');
  });

  it('renders prompt with one product showing separator and list', () => {
    render(<UserPromptBubble prompt="Compare these [ADDITIONAL CONTEXT: Widget Pro]" />);
    expect(screen.getByText('Compare these')).toBeDefined();
    expect(screen.getByText('Products:')).toBeDefined();
    expect(screen.getByText('Widget Pro')).toBeDefined();
  });

  it('renders prompt with multiple products showing all names', () => {
    render(
      <UserPromptBubble prompt="Which is better? [ADDITIONAL CONTEXT: Widget Pro, Gadget X, Super Item]" />
    );
    expect(screen.getByText('Which is better?')).toBeDefined();
    expect(screen.getByText('Widget Pro')).toBeDefined();
    expect(screen.getByText('Gadget X')).toBeDefined();
    expect(screen.getByText('Super Item')).toBeDefined();
  });

  it('handles empty prompt text with only context', () => {
    render(<UserPromptBubble prompt="[ADDITIONAL CONTEXT: Widget Pro]" />);
    expect(screen.getByText('Products:')).toBeDefined();
    expect(screen.getByText('Widget Pro')).toBeDefined();
  });
});
