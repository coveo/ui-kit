import {describe, expect, it} from 'vitest';
import type {Activity} from '@/src/internal/features/generative/index.js';
import {deriveCommerceSurfaceId} from './derive-surface-id.js';

function surfaceActivity(payload: Record<string, unknown>): Activity {
  return {id: 'a1', kind: 'a2ui-surface', replace: false, payload};
}

describe('deriveCommerceSurfaceId', () => {
  it('returns the surfaceId of a commerceSearch createSurface', () => {
    const activities = [
      surfaceActivity({
        messages: [{createSurface: {surfaceType: 'commerceSearch', surfaceId: 'ui-1'}}],
      }),
    ];

    expect(deriveCommerceSurfaceId(activities)).toBe('ui-1');
  });

  it('returns null when activities is undefined', () => {
    expect(deriveCommerceSurfaceId(undefined)).toBeNull();
  });

  it('returns null when no activity is an a2ui-surface', () => {
    const activities: Activity[] = [
      {id: 'a1', kind: 'text', replace: false, payload: {messages: []}},
    ];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('returns null when the surface is not a commerceSearch surfaceType', () => {
    const activities = [
      surfaceActivity({
        messages: [{createSurface: {surfaceType: 'converse', surfaceId: 'ui-1'}}],
      }),
    ];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('returns null when messages is not an array', () => {
    const activities = [surfaceActivity({messages: {createSurface: {}}})];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('returns null when createSurface lacks surfaceType or surfaceId', () => {
    const activities = [surfaceActivity({messages: [{createSurface: {surfaceId: 'ui-1'}}]})];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('scans multiple activities and returns the first commerceSearch surfaceId', () => {
    const activities = [
      surfaceActivity({messages: [{createSurface: {surfaceType: 'converse', surfaceId: 'c-1'}}]}),
      surfaceActivity({
        messages: [{createSurface: {surfaceType: 'commerceSearch', surfaceId: 'ui-2'}}],
      }),
    ];

    expect(deriveCommerceSurfaceId(activities)).toBe('ui-2');
  });
});
