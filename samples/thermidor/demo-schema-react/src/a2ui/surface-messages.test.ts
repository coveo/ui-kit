import {describe, expect, it} from 'vitest';
import {
  commerceSurfaceIds,
  filterSurfaceMessages,
  latestCommerceSurfaceId,
} from './surface-messages.js';

const AGENT_SURFACE = 'agent-1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';
const FIRST_SEARCH = 'ui-6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b';
const SECOND_SEARCH = 'ui-9b2f1c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d';

const SURFACES = [
  {surfaceId: AGENT_SURFACE, rootComponentType: 'SearchOptions'},
  {surfaceId: FIRST_SEARCH, rootComponentType: 'CommerceSearch'},
  {surfaceId: SECOND_SEARCH, rootComponentType: 'CommerceSearch'},
];

describe('commerceSurfaceIds', () => {
  it('lists the commerce-search surfaces in creation order', () => {
    expect(commerceSurfaceIds(SURFACES)).toEqual([FIRST_SEARCH, SECOND_SEARCH]);
  });

  it('is empty without surfaces', () => {
    expect(commerceSurfaceIds(undefined)).toEqual([]);
  });
});

describe('latestCommerceSurfaceId', () => {
  it('returns the last commerce-search surface opened on the turn', () => {
    expect(latestCommerceSurfaceId(SURFACES)).toBe(SECOND_SEARCH);
  });

  it('returns null when the turn has no commerce-search surface', () => {
    expect(latestCommerceSurfaceId([SURFACES[0]])).toBeNull();
  });
});

describe('filterSurfaceMessages', () => {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: AGENT_SURFACE}},
    {version: 'v0.9', updateComponents: {surfaceId: AGENT_SURFACE, components: []}},
    {version: 'v0.9', createSurface: {surfaceId: FIRST_SEARCH}},
    {version: 'v0.9', updateDataModel: {surfaceId: FIRST_SEARCH, path: '/state', value: {}}},
    {version: 'v0.9', deleteSurface: {surfaceId: AGENT_SURFACE}},
    {version: 'v0.9', actionResponse: {}},
  ];

  it('keeps every operation addressed to an accepted surface', () => {
    expect(filterSurfaceMessages(messages, (surfaceId) => surfaceId === FIRST_SEARCH)).toEqual([
      messages[2],
      messages[3],
      messages[5],
    ]);
  });

  it('drops every operation addressed to a rejected surface', () => {
    expect(filterSurfaceMessages(messages, (surfaceId) => surfaceId !== FIRST_SEARCH)).toEqual([
      messages[0],
      messages[1],
      messages[4],
      messages[5],
    ]);
  });
});
