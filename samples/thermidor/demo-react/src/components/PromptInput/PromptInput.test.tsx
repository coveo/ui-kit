import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {PromptInput} from './PromptInput.js';

describe('PromptInput', () => {
  it('renders a textarea with the provided placeholder', () => {
    render(<PromptInput onSubmit={vi.fn()} placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeDefined();
  });

  it('calls onSubmit with trimmed value when Enter is pressed', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: '  hello world  '}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('hello world');
  });

  it('does not submit on Shift+Enter (allows multiline)', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: 'hello'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter', shiftKey: true});

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when the submit button is clicked', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: 'search query'}});
    fireEvent.click(screen.getByLabelText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith('search query');
  });

  it('clears the textarea after submission', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    fireEvent.change(textarea, {target: {value: 'query'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(textarea.value).toBe('');
  });

  it('does not submit when input is empty or whitespace-only', () => {
    const onSubmit = vi.fn();
    render(<PromptInput onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: '   '}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables textarea and submit button when disabled prop is true', () => {
    render(<PromptInput onSubmit={vi.fn()} disabled />);

    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    const button = screen.getByLabelText('Submit') as HTMLButtonElement;

    expect(textarea.disabled).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('disables submit button when textarea is empty', () => {
    render(<PromptInput onSubmit={vi.fn()} />);
    const button = screen.getByLabelText('Submit') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('renders with initialValue pre-filled', () => {
    render(<PromptInput onSubmit={vi.fn()} initialValue="prefilled" />);
    const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
    expect(textarea.value).toBe('prefilled');
  });
});
