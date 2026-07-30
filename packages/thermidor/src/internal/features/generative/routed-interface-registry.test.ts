import {describe, it, expect} from 'vitest';
import {RoutedInterfaceRegistry, mergeTurnsWithRegistry} from './routed-interface-registry.js';
import type {RoutedInterfaceEntry} from './routed-interface-registry.js';
import type {StateTurn} from './generative-types.js';
import type {CommerceInterface, SearchInterface} from '@/src/internal/utils/index.js';

function createEntry(overrides: Partial<RoutedInterfaceEntry> = {}): RoutedInterfaceEntry {
  return {
    useCase: 'commerceSearch',
    interface: {} as CommerceInterface,
    snapshot: {results: []},
    query: 'shoes',
    ...overrides,
  };
}

function createStateTurn(overrides: Partial<StateTurn> = {}): StateTurn {
  return {
    id: 'turn-1',
    prompt: 'find shoes',
    status: 'complete',
    ...overrides,
  };
}

describe('RoutedInterfaceRegistry', () => {
  describe('register / get', () => {
    it('stores and retrieves an entry by turnId', () => {
      const registry = new RoutedInterfaceRegistry();
      const entry = createEntry();

      registry.register('turn-1', entry);

      expect(registry.get('turn-1')).toBe(entry);
    });

    it('returns undefined for an unknown turnId', () => {
      const registry = new RoutedInterfaceRegistry();

      expect(registry.get('unknown')).toBeUndefined();
    });

    it('overwrites a previous entry for the same turnId', () => {
      const registry = new RoutedInterfaceRegistry();
      const first = createEntry({query: 'first'});
      const second = createEntry({query: 'second'});

      registry.register('turn-1', first);
      registry.register('turn-1', second);

      expect(registry.get('turn-1')).toBe(second);
    });
  });

  describe('remove', () => {
    it('removes an existing entry', () => {
      const registry = new RoutedInterfaceRegistry();
      registry.register('turn-1', createEntry());

      registry.remove('turn-1');

      expect(registry.get('turn-1')).toBeUndefined();
    });

    it('is a no-op for an unknown turnId', () => {
      const registry = new RoutedInterfaceRegistry();
      registry.register('turn-1', createEntry());

      registry.remove('unknown');

      expect(registry.get('turn-1')).toBeDefined();
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      const registry = new RoutedInterfaceRegistry();
      registry.register('turn-1', createEntry());
      registry.register('turn-2', createEntry({query: 'other'}));

      registry.clear();

      expect(registry.get('turn-1')).toBeUndefined();
      expect(registry.get('turn-2')).toBeUndefined();
    });
  });

  describe('entries', () => {
    it('iterates over all registered entries', () => {
      const registry = new RoutedInterfaceRegistry();
      const e1 = createEntry({query: 'a'});
      const e2 = createEntry({query: 'b'});
      registry.register('turn-1', e1);
      registry.register('turn-2', e2);

      const result = [...registry.entries()];

      expect(result).toEqual([
        ['turn-1', e1],
        ['turn-2', e2],
      ]);
    });
  });
});

describe('mergeTurnsWithRegistry', () => {
  it('passes through turns without routedInterface unchanged', () => {
    const registry = new RoutedInterfaceRegistry();
    const turn = createStateTurn();

    const [merged] = mergeTurnsWithRegistry([turn], registry);

    expect(merged).toEqual(turn);
    expect(merged.routedInterface).toBeUndefined();
  });

  it('merges the registry interface into a turn that has routedInterface', () => {
    const registry = new RoutedInterfaceRegistry();
    const iface = {} as CommerceInterface;
    registry.register('turn-1', createEntry({interface: iface}));

    const turn = createStateTurn({
      routedInterface: {useCase: 'commerceSearch'},
    });

    const [merged] = mergeTurnsWithRegistry([turn], registry);

    expect(merged.routedInterface).toEqual({
      useCase: 'commerceSearch',
      interface: iface,
    });
  });

  it('strips routedInterface when registry has no entry', () => {
    const registry = new RoutedInterfaceRegistry();
    const turn = createStateTurn({
      routedInterface: {useCase: 'search'},
    });

    const [merged] = mergeTurnsWithRegistry([turn], registry);

    expect(merged.routedInterface).toBeUndefined();
  });

  it('handles a mix of turns with and without routed interfaces', () => {
    const registry = new RoutedInterfaceRegistry();
    const iface = {} as SearchInterface;
    registry.register(
      'turn-2',
      createEntry({
        useCase: 'search',
        interface: iface,
      })
    );

    const turns: StateTurn[] = [
      createStateTurn({id: 'turn-1', prompt: 'hello'}),
      createStateTurn({
        id: 'turn-2',
        prompt: 'search docs',
        routedInterface: {useCase: 'search'},
      }),
      createStateTurn({id: 'turn-3', prompt: 'thanks', status: 'streaming'}),
    ];

    const merged = mergeTurnsWithRegistry(turns, registry);

    expect(merged).toHaveLength(3);
    expect(merged[0].routedInterface).toBeUndefined();
    expect(merged[1].routedInterface).toEqual({
      useCase: 'search',
      interface: iface,
    });
    expect(merged[2].routedInterface).toBeUndefined();
  });

  it('preserves all non-routedInterface fields from the state turn', () => {
    const registry = new RoutedInterfaceRegistry();
    registry.register('turn-1', createEntry());

    const turn = createStateTurn({
      id: 'turn-1',
      prompt: 'find shoes',
      status: 'complete',
      routedInterface: {useCase: 'commerceSearch'},
      agentResponse: {
        messages: [{content: 'here', role: 'assistant'}],
        surfaces: [],
        toolCalls: [],
        reasoningContent: '',
      },
    });

    const [merged] = mergeTurnsWithRegistry([turn], registry);

    expect(merged.id).toBe('turn-1');
    expect(merged.prompt).toBe('find shoes');
    expect(merged.status).toBe('complete');
    expect(merged.agentResponse?.messages[0].content).toBe('here');
  });
});
