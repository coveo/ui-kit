import {describe, expect, it} from 'vitest';
import type {Activity} from '@/src/internal/features/generative/index.js';
import {deriveCommerceSurfaceId} from './derive-surface-id.js';

function surfaceActivity(payload: Record<string, unknown>): Activity {
  return {id: 'a1', kind: 'a2ui-surface', replace: false, payload};
}

function commerceSurfaceMessage(surfaceId: string) {
  const rootId = `${surfaceId}-root`;
  return {
    version: 'v1.0',
    createSurface: {
      surfaceId,
      rootId,
      components: [
        {
          id: rootId,
          component: 'CommerceSearch',
          props: {componentId: rootId, componentType: 'commerce-search'},
          children: ['facet-manager', 'product-list'],
        },
      ],
    },
  };
}

describe('deriveCommerceSurfaceId', () => {
  it('returns the surfaceId when the root component is a commerce-search surface', () => {
    const activities = [surfaceActivity({messages: [commerceSurfaceMessage('ui-1')]})];

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

  it('returns null when messages is not an array', () => {
    const activities = [surfaceActivity({messages: {createSurface: {}}})];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('returns null when createSurface lacks a rootId', () => {
    const activities = [
      surfaceActivity({
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: 'ui-1',
              components: [{id: 'ui-1-root', props: {componentType: 'commerce-search'}}],
            },
          },
        ],
      }),
    ];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('returns null when no component matches the rootId', () => {
    const activities = [
      surfaceActivity({
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: 'ui-1',
              rootId: 'missing-root',
              components: [{id: 'other-node', props: {componentType: 'commerce-search'}}],
            },
          },
        ],
      }),
    ];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('returns null when the root component type is not commerce-search', () => {
    const activities = [
      surfaceActivity({
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: 'ui-1',
              rootId: 'ui-1-root',
              components: [
                {
                  id: 'ui-1-root',
                  component: 'Converse',
                  props: {componentId: 'ui-1-root', componentType: 'converse'},
                },
              ],
            },
          },
        ],
      }),
    ];

    expect(deriveCommerceSurfaceId(activities)).toBeNull();
  });

  it('scans multiple activities and returns the first commerce-search surfaceId', () => {
    const activities = [
      surfaceActivity({
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId: 'c-1',
              rootId: 'c-1-root',
              components: [
                {
                  id: 'c-1-root',
                  component: 'Converse',
                  props: {componentId: 'c-1-root', componentType: 'converse'},
                },
              ],
            },
          },
        ],
      }),
      surfaceActivity({messages: [commerceSurfaceMessage('ui-2')]}),
      surfaceActivity({messages: [commerceSurfaceMessage('ui-3')]}),
    ];

    expect(deriveCommerceSurfaceId(activities)).toBe('ui-2');
  });
});
