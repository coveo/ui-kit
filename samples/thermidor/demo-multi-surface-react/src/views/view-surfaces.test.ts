import {describe, expect, it} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {makeTurn} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {
  ASSISTANT_CONTEXT,
  HOME_CONTEXT,
  SHELL_CONTEXT,
  type StorefrontContext,
} from '../session/turn-scheduler.js';
import {buildViewSurfaces} from './view-surfaces.js';

const create = (surfaceId: string) => ({version: 'v0.9', createSurface: {surfaceId}});
const remove = (surfaceId: string) => ({version: 'v0.9', deleteSurface: {surfaceId}});

function turn(id: string, a2uiMessages: Record<string, unknown>[] = [], status?: Turn['status']) {
  return makeTurn({id, status, response: {a2uiMessages}});
}

function views(turns: Turn[], tags: Record<string, {context: StorefrontContext; visit?: number}>) {
  const turnContexts = new Map<string, StorefrontContext>();
  const turnVisits = new Map<string, number>();
  for (const [turnId, {context, visit}] of Object.entries(tags)) {
    turnContexts.set(turnId, context);
    if (visit !== undefined) {
      turnVisits.set(turnId, visit);
    }
  }
  return buildViewSurfaces(turns, {turnContexts, turnVisits});
}

describe('buildViewSurfaces', () => {
  it("draws each page visit's own surfaces, and nothing of another visit", () => {
    const result = views(
      [turn('t1', [create('ui-home-1'), create('ui-home-2')]), turn('t2', [create('ui-answer')])],
      {t1: {context: HOME_CONTEXT, visit: 1}, t2: {context: ASSISTANT_CONTEXT, visit: 2}}
    );

    expect(result.surfacesOfVisit(1)).toEqual(['t1/ui-home-1', 't1/ui-home-2']);
    expect(result.surfacesOfVisit(2)).toEqual(['t2/ui-answer']);
    expect(result.turnsOfVisit(2).map(({id}) => id)).toEqual(['t2']);
  });

  it('keeps shell turns out of every page visit', () => {
    const result = views(
      [turn('t1', [create('ui-home')]), turn('t2', [create('ui-suggestions')])],
      {t1: {context: HOME_CONTEXT, visit: 1}, t2: {context: SHELL_CONTEXT}}
    );

    expect(result.surfacesOfVisit(1)).toEqual(['t1/ui-home']);
    expect(result.suggestions).toEqual(['t2/ui-suggestions']);
  });

  it('shows the suggestions of the latest shell turn that created any', () => {
    const result = views(
      [
        turn('t1', [create('ui-s1')]),
        turn('t2', [remove('ui-s1'), create('ui-s2')]),
        turn('t3', [], 'error'),
      ],
      {t1: {context: SHELL_CONTEXT}, t2: {context: SHELL_CONTEXT}, t3: {context: SHELL_CONTEXT}}
    );

    expect(result.suggestions).toEqual(['t2/ui-s2']);
  });

  it('drops a page surface a later turn deletes', () => {
    const result = views(
      [turn('t1', [create('ui-home')]), turn('t2', [remove('ui-home'), create('ui-answer')])],
      {t1: {context: HOME_CONTEXT, visit: 1}, t2: {context: ASSISTANT_CONTEXT, visit: 2}}
    );

    expect(result.surfacesOfVisit(1)).toEqual([]);
    expect(result.surfacesOfVisit(2)).toEqual(['t2/ui-answer']);
  });

  it('names the latest turn, the only one whose surfaces send actions', () => {
    const result = views([turn('t1', [create('ui-home')]), turn('t2')], {
      t1: {context: HOME_CONTEXT, visit: 1},
      t2: {context: SHELL_CONTEXT},
    });

    expect(result.latestTurnId).toBe('t2');
  });
});
