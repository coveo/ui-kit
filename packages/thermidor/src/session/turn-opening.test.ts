import {describe, expect, it} from 'vitest';
import {isTurnOpeningAction} from './turn-opening.js';
import type {Activity} from './types.js';

function snapshot(metadata?: Record<string, unknown>): Activity {
  return {
    id: 'activity',
    kind: 'a2ui-surface',
    replace: true,
    payload: {messages: []},
    ...(metadata && {metadata}),
  };
}

const announcing = (turnOpeningActions: unknown) => snapshot({turnOpeningActions});

describe('isTurnOpeningAction', () => {
  it('reads the actions the producer announces for the surface', () => {
    const activities = [announcing({bar: ['selectAction', 'selectSearchOption']})];

    expect(isTurnOpeningAction(activities, 'bar', 'selectAction')).toBe(true);
    expect(isTurnOpeningAction(activities, 'bar', 'selectSearchOption')).toBe(true);
    expect(isTurnOpeningAction(activities, 'bar', 'toggleSelect')).toBe(false);
    expect(isTurnOpeningAction(activities, 'other', 'selectAction')).toBe(false);
  });

  it('keeps the latest announcement for the surface', () => {
    const activities = [announcing({bar: ['selectAction']}), announcing({bar: []})];

    expect(isTurnOpeningAction(activities, 'bar', 'selectAction')).toBe(false);
  });

  it('keeps an earlier announcement when a later snapshot says nothing about the surface', () => {
    const activities = [announcing({bar: ['selectAction']}), snapshot(), announcing({other: []})];

    expect(isTurnOpeningAction(activities, 'bar', 'selectAction')).toBe(true);
  });

  it('ignores an announcement that does not have the expected shape', () => {
    expect(isTurnOpeningAction([announcing('selectAction')], 'bar', 'selectAction')).toBe(false);
    expect(isTurnOpeningAction([announcing({bar: 'selectAction'})], 'bar', 'selectAction')).toBe(
      false
    );
    expect(
      isTurnOpeningAction([snapshot({other: {bar: ['selectAction']}})], 'bar', 'selectAction')
    ).toBe(false);
  });

  it('keeps an earlier announcement when a later one for the surface is malformed', () => {
    const valid = announcing({bar: ['selectAction']});

    expect(
      isTurnOpeningAction([valid, announcing({bar: 'selectAction'})], 'bar', 'selectAction')
    ).toBe(true);
    expect(
      isTurnOpeningAction([valid, announcing({bar: ['selectAction', 42]})], 'bar', 'selectAction')
    ).toBe(true);
  });
});
