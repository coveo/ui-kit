import {screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {LandingPage} from './LandingPage.js';
import {answerLookups, createTestSession, renderWithSession} from '../../test/session.js';

describe('LandingPage query suggestions', () => {
  it('shows no completions before the shopper types', () => {
    renderWithSession(<LandingPage onSubmit={vi.fn()} isStreaming={false} />);

    fireEvent.focus(screen.getByLabelText('Prompt'));

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens the completions for what the shopper types below the input, and submits a selected one', async () => {
    const onSubmit = vi.fn();
    renderWithSession(
      <LandingPage onSubmit={onSubmit} isStreaming={false} />,
      createTestSession(answerLookups).session
    );

    const textarea = screen.getByLabelText('Prompt');
    textarea.focus();
    fireEvent.change(textarea, {target: {value: 'surf'}});
    const option = await screen.findByRole('option', {name: /surf boards/});

    expect(screen.getByRole('listbox').className).not.toMatch(/above/);
    fireEvent.mouseDown(option);
    expect(onSubmit).toHaveBeenCalledWith('surf boards');
  });
});
