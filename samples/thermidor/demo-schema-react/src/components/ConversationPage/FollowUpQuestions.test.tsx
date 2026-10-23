import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {FollowUpQuestions} from './FollowUpQuestions.js';

describe('FollowUpQuestions', () => {
  it('asks a question when its button is clicked', () => {
    const onSelect = vi.fn();
    render(<FollowUpQuestions questions={['First?', 'Second?']} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', {name: 'Second?'}));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('Second?');
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'First?',
      'Second?',
    ]);
  });

  it('shows nothing without questions', () => {
    const {container} = render(<FollowUpQuestions questions={[]} onSelect={vi.fn()} />);

    expect(container.innerHTML).toBe('');
  });
});
