import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import App from '../App.js';
import {USE_CASES} from './use-cases.js';

const MULTI_SURFACE_USE_CASES = [
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
  'UC-31',
  'UC-34',
];

const OTHER_USE_CASES = [
  'UC-01',
  'UC-02',
  'UC-03',
  'UC-05',
  'UC-13',
  'UC-14',
  'UC-15',
  'UC-16',
  'UC-17',
  'UC-18',
  'UC-19',
  'UC-20',
  'UC-21',
  'UC-22',
  'UC-23',
  'UC-25',
  'UC-26',
  'UC-27',
  'UC-28',
  'UC-29',
  'UC-32',
  'UC-33',
];

const idsOf = (group: string) =>
  USE_CASES.filter((useCase) => useCase.group === group).map(({id}) => id);

describe('use cases', () => {
  it("has one scenario per use case of the sheet, in its tab's group, titled with its id", () => {
    expect(idsOf('multi-surface')).toEqual(MULTI_SURFACE_USE_CASES);
    expect(idsOf('other')).toEqual(OTHER_USE_CASES);
    for (const {id, title, group} of USE_CASES) {
      if (group !== 'edge') {
        expect(title.startsWith(`${id} · `)).toBe(true);
      }
    }
  });

  it('gives every scenario a status, a reason to any that is not ready, and steps unless it cannot be replayed', () => {
    for (const {steps, status} of USE_CASES) {
      if (status.state !== 'ready') {
        expect(status.note).toBeTruthy();
      }
      if (steps.length === 0) {
        expect(status.state).toBe('not-ready');
      }
    }
  });

  it('relates scenarios only to scenarios of the list', () => {
    const ids = new Set(USE_CASES.map(({id}) => id));
    for (const {related = []} of USE_CASES) {
      for (const id of related) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });
});

describe('UseCasePlayer', () => {
  afterEach(cleanup);

  it("groups the use cases by tab of the sheet, then the edge checks, and shows the selected one's status", () => {
    render(<App />);
    const player = screen.getByRole('region', {name: 'Use case player'});
    const select = within(player).getByRole('combobox', {name: 'Use case'});

    expect(
      within(select)
        .getAllByRole('group')
        .map((group) => group.getAttribute('label'))
    ).toEqual(['Multi-surface', 'Other use cases', 'Edge checks']);

    fireEvent.change(select, {target: {value: 'UC-08'}});
    expect(within(player).getByText('Status: Partly working')).toBeTruthy();

    fireEvent.change(select, {target: {value: 'UC-11'}});
    expect(within(player).getByText('Status: Not ready')).toBeTruthy();
    expect(within(player).getByRole('list', {name: 'Steps'})).toBeTruthy();
  });

  it('cannot play a use case that has no steps', () => {
    render(<App />);
    const player = screen.getByRole('region', {name: 'Use case player'});
    const select = within(player).getByRole('combobox', {name: 'Use case'});

    fireEvent.change(select, {target: {value: 'UC-27'}});

    expect(within(player).getByRole('button', {name: '▶ Play'})).toHaveProperty('disabled', true);
    expect(within(player).queryByRole('list', {name: 'Steps'})).toBeNull();
    expect(within(player).getByText('Nothing to play in this sample')).toBeTruthy();
  });

  it('selects a related use case', () => {
    render(<App />);
    const player = screen.getByRole('region', {name: 'Use case player'});
    const select = within(player).getByRole('combobox', {name: 'Use case'});

    fireEvent.change(select, {target: {value: 'UC-08'}});
    fireEvent.click(within(player).getByRole('button', {name: /^UC-28 · /}));

    expect((select as HTMLSelectElement).value).toBe('UC-28');
  });
});
