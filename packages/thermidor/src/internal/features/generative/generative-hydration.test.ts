import {describe, it, expect} from 'vitest';
import {Engine} from '@/src/internal/engine/index.js';
import {getOrCreateHydrateFromSnapshotAction} from './generative-hydration.js';
import {buildGenerativeUnifiedInterface} from '@/src/public/interfaces/generative-unified.js';

function createTestEngine() {
  return new Engine({
    configuration: {
      organizationId: 'test-org',
      accessToken: 'test-token',
      trackingId: 'test',
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
  });
}

describe('getOrCreateHydrateFromSnapshotAction', () => {
  it('returns the same action for the same interfaceId', () => {
    const engine = createTestEngine();
    const iface = buildGenerativeUnifiedInterface({engine, id: 'test-id'});
    const action1 = getOrCreateHydrateFromSnapshotAction(iface);
    const action2 = getOrCreateHydrateFromSnapshotAction(iface);
    expect(action1).toBe(action2);
  });

  it('returns different actions for different interfaceIds', () => {
    const engine = createTestEngine();
    const ifaceA = buildGenerativeUnifiedInterface({engine, id: 'id-a'});
    const ifaceB = buildGenerativeUnifiedInterface({engine, id: 'id-b'});
    const action1 = getOrCreateHydrateFromSnapshotAction(ifaceA);
    const action2 = getOrCreateHydrateFromSnapshotAction(ifaceB);
    expect(action1).not.toBe(action2);
  });

  it('creates an action with the correct type pattern', () => {
    const engine = createTestEngine();
    const iface = buildGenerativeUnifiedInterface({engine, id: 'my-interface'});
    const action = getOrCreateHydrateFromSnapshotAction(iface);
    expect(action.type).toBe('my-interface/hydrateFromSnapshot');
  });
});
