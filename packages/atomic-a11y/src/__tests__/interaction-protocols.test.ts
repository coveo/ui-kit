import {describe, expect, it} from 'vitest';
import type {InteractionProtocol} from '../audit/interaction-protocols.js';
import {INTERACTION_PROTOCOLS} from '../audit/interaction-protocols.js';

describe('INTERACTION_PROTOCOLS', () => {
  it('should contain exactly 44 entries', () => {
    expect(INTERACTION_PROTOCOLS).toHaveLength(44);
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

  it('should have a non-empty apgPattern string on every keyboard protocol', () => {
    const keyboardProtocols = INTERACTION_PROTOCOLS.filter(
      (p) => !p.expectsLiveRegion
    );
    for (const protocol of keyboardProtocols) {
      expect(protocol.apgPattern).toBeTruthy();
      expect(typeof protocol.apgPattern).toBe('string');
    }
  });

  it('should have a non-empty stateAttributes array on every keyboard protocol', () => {
    const keyboardProtocols = INTERACTION_PROTOCOLS.filter(
      (p) => !p.expectsLiveRegion
    );
    for (const protocol of keyboardProtocols) {
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

  it('should have at least one action with focusFirst: true for every interactive keyboard entry', () => {
    const interactiveKeyboard = INTERACTION_PROTOCOLS.filter(
      (p) => p.actions.length > 0 && !p.expectsLiveRegion
    );

    for (const protocol of interactiveKeyboard) {
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

  it('should have a non-empty keys array with at least one key on every keyboard protocol action', () => {
    const keyboardProtocols = INTERACTION_PROTOCOLS.filter(
      (p) => !p.expectsLiveRegion
    );
    for (const protocol of keyboardProtocols) {
      for (const action of protocol.actions) {
        expect(Array.isArray(action.keys)).toBe(true);
        expect(
          action.keys.length,
          `action "${action.name}" in protocol "${protocol.role}" should have at least one key`
        ).toBeGreaterThan(0);
      }
    }
  });

  it('should have expectsLiveRegion and liveRegionSelector on every live-region protocol', () => {
    const liveRegionProtocols = INTERACTION_PROTOCOLS.filter(
      (p) => p.expectsLiveRegion === true
    );
    expect(liveRegionProtocols.length).toBeGreaterThanOrEqual(14);
    for (const protocol of liveRegionProtocols) {
      expect(
        protocol.liveRegionSelector,
        `"${protocol.role}" needs liveRegionSelector`
      ).toBeTruthy();
      expect(protocol.stateAttributes).toEqual([]);
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
