import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {UserPromptBubble} from './UserPromptBubble.js';

describe('UserPromptBubble', () => {
  it('displays the prompt text', () => {
    render(<UserPromptBubble prompt="What are the best running shoes?" />);
    expect(screen.getByText('What are the best running shoes?')).toBeDefined();
  });

  it('applies the bubble class for right-alignment styling', () => {
    const {container} = render(<UserPromptBubble prompt="hello" />);
    const bubble = container.firstElementChild as HTMLElement;
    expect(bubble.className).toContain('bubble');
  });
});
