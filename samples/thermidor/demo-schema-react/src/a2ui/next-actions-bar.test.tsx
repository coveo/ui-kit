import {describe, it, expect, afterEach} from 'vitest';
import {screen, fireEvent, cleanup, waitFor} from '@testing-library/react';
import type {NextActionsBarProps} from '@coveo/thermidor-schema';
import {mountSurface} from './mount-surface.harness.js';

afterEach(cleanup);

function mountControl<TProps extends object>(
  component: string,
  state: TProps,
  dispatchGate?: () => Promise<void> | void
) {
  return mountSurface({
    component: {
      component,
      ...Object.fromEntries(Object.keys(state).map((key) => [key, {path: `/state/root/${key}`}])),
    },
    dispatchGate,
    dataModel: (Object.keys(state) as Array<keyof TProps>).map((key) => ({
      path: `/state/root/${String(key)}`,
      value: state[key],
    })),
  });
}

function heldOpen() {
  let answer!: () => void;
  const pending = new Promise<void>((resolve) => (answer = resolve));
  return {gate: () => pending, answer: () => answer()};
}

describe('NextActionsBar', () => {
  const state: NextActionsBarProps = {
    suggestedActions: [
      {text: 'Show me wetsuits', type: 'search'},
      {text: 'Compare these', type: 'followup'},
    ],
  };

  it('marks itself busy while its own selection is outstanding', async () => {
    const held = heldOpen();
    mountControl('NextActionsBar', state, held.gate);

    await waitFor(() => expect(screen.getByText('Show me wetsuits')).toBeDefined());
    const chip = screen.getByText('Show me wetsuits').closest('button')!;
    expect(chip.hasAttribute('disabled')).toBe(false);

    fireEvent.click(chip);

    await waitFor(() =>
      expect(screen.getByText('Show me wetsuits').closest('button')!.hasAttribute('disabled')).toBe(
        true
      )
    );
    expect(screen.getByText('Compare these').closest('button')!.hasAttribute('disabled')).toBe(
      true
    );
    held.answer();
  });
});
