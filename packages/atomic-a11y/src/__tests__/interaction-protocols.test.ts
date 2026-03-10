import {describe, expect, it} from 'vitest';
import type {InteractionProtocol} from '../audit/interaction-protocols.js';
import {INTERACTION_PROTOCOLS} from '../audit/interaction-protocols.js';

describe('INTERACTION_PROTOCOLS', () => {
  it('should contain exactly 30 entries', () => {
    expect(INTERACTION_PROTOCOLS).toHaveLength(30);
  });

  it('should have a non-empty role string on every entry', () => {
    for (const protocol of INTERACTION_PROTOCOLS) {
      expect(protocol.role).toBeTruthy();
      expect(typeof protocol.role).toBe('string');
    }
  });

  it('should have a non-empty selector string on every entry', () => {
    for (const protocol of INTERACTION_PROTOCOLS) {
      expect(protocol.selector).toBeTruthy();
      expect(typeof protocol.selector).toBe('string');
    }
  });

  it('should have a non-empty apgPattern string on every entry', () => {
    for (const protocol of INTERACTION_PROTOCOLS) {
      expect(protocol.apgPattern).toBeTruthy();
      expect(typeof protocol.apgPattern).toBe('string');
    }
  });

  it('should have a non-empty stateAttributes array on every entry', () => {
    for (const protocol of INTERACTION_PROTOCOLS) {
      expect(Array.isArray(protocol.stateAttributes)).toBe(true);
      expect(protocol.stateAttributes.length).toBeGreaterThan(0);
    }
  });

  it('should have an actions array on every entry', () => {
    for (const protocol of INTERACTION_PROTOCOLS) {
      expect(Array.isArray(protocol.actions)).toBe(true);
    }
  });

  it('should have actions: [] for non-interactive patterns (alert, breadcrumb, landmark, meter)', () => {
    const nonInteractiveRoles = ['alert', 'breadcrumb', 'landmark', 'meter'];

    for (const role of nonInteractiveRoles) {
      const protocol = INTERACTION_PROTOCOLS.find((p) => p.role === role);
      expect(
        protocol,
        `expected to find protocol for role "${role}"`
      ).toBeDefined();
      expect(protocol!.actions).toEqual([]);
    }
  });

  it('should have at least one action with focusFirst: true for every interactive entry', () => {
    const interactiveProtocols = INTERACTION_PROTOCOLS.filter(
      (p) => p.actions.length > 0
    );

    for (const protocol of interactiveProtocols) {
      const hasFocusFirst = protocol.actions.some(
        (action) => action.focusFirst === true
      );
      expect(
        hasFocusFirst,
        `interactive protocol "${protocol.role}" should have at least one action with focusFirst: true`
      ).toBe(true);
    }
  });

  it('should have a non-empty name string on every action', () => {
    for (const protocol of INTERACTION_PROTOCOLS) {
      for (const action of protocol.actions) {
        expect(action.name).toBeTruthy();
        expect(typeof action.name).toBe('string');
      }
    }
  });

  it('should have a non-empty keys array with at least one key on every action', () => {
    for (const protocol of INTERACTION_PROTOCOLS) {
      for (const action of protocol.actions) {
        expect(Array.isArray(action.keys)).toBe(true);
        expect(
          action.keys.length,
          `action "${action.name}" in protocol "${protocol.role}" should have at least one key`
        ).toBeGreaterThan(0);
      }
    }
  });

  it('should have no duplicate role values across entries', () => {
    const roles = INTERACTION_PROTOCOLS.map((p) => p.role);
    const uniqueRoles = new Set(roles);
    expect(roles.length).toBe(uniqueRoles.size);
  });

  it('should export the InteractionProtocol type', () => {
    const protocol: InteractionProtocol = INTERACTION_PROTOCOLS[0];
    expect(protocol).toBeDefined();
  });

  it('should export INTERACTION_PROTOCOLS as an array', () => {
    expect(Array.isArray(INTERACTION_PROTOCOLS)).toBe(true);
  });
});
