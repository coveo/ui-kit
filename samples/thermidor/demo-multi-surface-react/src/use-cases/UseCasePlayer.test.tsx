import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import App from '../App.js';
import {USE_CASES} from './use-cases.js';

const PM_USE_CASES = [
  'UC-04',
  'UC-06',
  'UC-07',
  'UC-08',
  'UC-09',
  'UC-10',
  'UC-11',
  'UC-12',
  'UC-24',
  'UC-30',
  'UC-34',
];

describe('use cases', () => {
  it('has one scenario per multi-surface use case, titled with its id', () => {
    const pm = USE_CASES.filter(({group}) => group === 'pm');
    expect(pm.map(({id}) => id)).toEqual(PM_USE_CASES);
    for (const {id, title} of pm) {
      expect(title.startsWith(`${id} · `)).toBe(true);
    }
  });

  it('gives every scenario steps and a status, and a reason to any that is not ready', () => {
    for (const {steps, status} of USE_CASES) {
      expect(steps.length).toBeGreaterThan(0);
      if (status.state !== 'ready') {
        expect(status.note).toBeTruthy();
      }
    }
  });
});

describe('UseCasePlayer', () => {
  afterEach(cleanup);

  it("groups the use cases apart from the edge checks, and shows the selected one's status", () => {
    render(<App />);
    const player = screen.getByRole('region', {name: 'Use case player'});
    const select = within(player).getByRole('combobox', {name: 'Use case'});

    expect(within(select).getByRole('group', {name: 'Use cases'})).toBeTruthy();
    expect(within(select).getByRole('group', {name: 'Edge checks'})).toBeTruthy();

    fireEvent.change(select, {target: {value: 'UC-08'}});
    expect(within(player).getByText('Status: Partly working')).toBeTruthy();

    fireEvent.change(select, {target: {value: 'UC-11'}});
    expect(within(player).getByText('Status: Not ready')).toBeTruthy();
    expect(within(player).getAllByRole('listitem').length).toBeGreaterThan(0);
  });
});
