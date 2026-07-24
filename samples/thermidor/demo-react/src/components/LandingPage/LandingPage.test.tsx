import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {LandingPage} from './LandingPage.js';

describe('LandingPage suggestions integration', () => {
  it('passes 2 suggestion sections to PromptInput', () => {
    render(<LandingPage onSubmit={vi.fn()} isStreaming={false} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    const listbox = screen.getByRole('listbox');
    const groups = listbox.querySelectorAll('[role="group"]');

    expect(groups).toHaveLength(2);
  });

  it('calls onSubmit with the item label when a search suggestion is selected', () => {
    const onSubmit = vi.fn();
    render(<LandingPage onSubmit={onSubmit} isStreaming={false} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    const surfboardsOption = screen.getByRole('option', {name: /Surfboards/});
    fireEvent.mouseDown(surfboardsOption);

    expect(onSubmit).toHaveBeenCalledWith('Surfboards');
  });

  it('calls onSubmit with the item label when a conversational suggestion is selected', () => {
    const onSubmit = vi.fn();
    render(<LandingPage onSubmit={onSubmit} isStreaming={false} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    const conversationalOption = screen.getByRole('option', {
      name: /Build a beginner surfing kit/,
    });
    fireEvent.mouseDown(conversationalOption);

    expect(onSubmit).toHaveBeenCalledWith('Build a beginner surfing kit');
  });
});
