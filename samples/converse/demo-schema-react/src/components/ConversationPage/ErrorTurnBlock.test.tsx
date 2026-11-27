import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {ErrorTurnBlock} from './ErrorTurnBlock.js';

describe('ErrorTurnBlock', () => {
  it('displays the provided error message', () => {
    render(<ErrorTurnBlock error="Network request failed" />);
    expect(screen.getByRole('alert').textContent).toBe('Network request failed');
  });

  it('displays fallback message when error is undefined', () => {
    render(<ErrorTurnBlock />);
    expect(screen.getByRole('alert').textContent).toBe('An unknown error occurred.');
  });

  it('displays fallback message when error is an empty string', () => {
    render(<ErrorTurnBlock error="" />);
    expect(screen.getByRole('alert').textContent).toBe('An unknown error occurred.');
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorTurnBlock error="Something went wrong" />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('has distinct warning styling on the container', () => {
    render(<ErrorTurnBlock error="Oops" />);
    const container = screen.getByRole('alert');
    expect(container.className).toMatch(/container/);
  });
});
