import {describe, expect, it} from 'vitest';
import {resolveOperation} from './resolve-operation.js';
import {STATE_NAMESPACE, jsonPointerEscape, statePath} from './state-path.js';

/**
 * Unit tests for the inline-TRANSPORT conventions the runtime owns after they
 * were moved out of `@coveo/thermidor-schema`: the node→path mapping
 * (`statePath`) and the operation resolver (`resolveOperation`). Covers
 * `statePath` totality/injectivity/stability, RFC 6901 escaping, and
 * `resolveOperation` accept/reject cases.
 */

describe('STATE_NAMESPACE', () => {
  it('is the server-owned root prefix', () => {
    expect(STATE_NAMESPACE).toBe('/state');
  });
});

describe('jsonPointerEscape', () => {
  it('escapes tilde to ~0', () => {
    expect(jsonPointerEscape('a~b')).toBe('a~0b');
  });

  it('escapes slash to ~1', () => {
    expect(jsonPointerEscape('a/b')).toBe('a~1b');
  });

  it('escapes tilde before slash so ~1 is not double-escaped', () => {
    // "~1" -> "~01" (tilde first), not "~11".
    expect(jsonPointerEscape('~1')).toBe('~01');
  });

  it('is the identity for kebab-case node ids', () => {
    expect(jsonPointerEscape('pagination-2')).toBe('pagination-2');
  });
});

describe('statePath', () => {
  const ids = ['pagination-2', 'facet-manager', 'commerce-search', 'a', 'query-summary'];

  it('is total: produces a /state-rooted path for each id', () => {
    for (const id of ids) {
      expect(statePath(id)).toBe(`/state/${id}`);
    }
  });

  it('is stable: same id -> identical path across calls', () => {
    for (const id of ids) {
      expect(statePath(id)).toBe(statePath(id));
    }
  });

  it('is injective: distinct ids -> distinct paths', () => {
    const paths = ids.map(statePath);
    expect(new Set(paths).size).toBe(ids.length);
  });

  it('composes STATE_NAMESPACE + escaped id', () => {
    expect(statePath('a/b')).toBe('/state/a~1b');
  });
});

describe('resolveOperation', () => {
  const present = ['pagination-2', 'facet-manager'];

  it('resolves a whole-component op at statePath(id)', () => {
    const result = resolveOperation({path: statePath('pagination-2')}, present);
    expect(result).toEqual({resolved: true, nodeId: 'pagination-2', wholeComponent: true});
  });

  it('resolves a partial op at a sub-path beneath statePath(id)', () => {
    const result = resolveOperation({path: `${statePath('pagination-2')}/page`}, present);
    expect(result).toEqual({resolved: true, nodeId: 'pagination-2', wholeComponent: false});
  });

  it('accepts a Set of present ids', () => {
    const result = resolveOperation({path: statePath('facet-manager')}, new Set(present));
    expect(result).toEqual({resolved: true, nodeId: 'facet-manager', wholeComponent: true});
  });

  it('rejects a path outside the /state namespace', () => {
    const result = resolveOperation({path: '/other/pagination-2'}, present);
    expect(result).toEqual({
      resolved: false,
      unresolvedPath: '/other/pagination-2',
      reason: 'outside-state-namespace',
    });
  });

  it('rejects a /state/<id> path whose id is not present', () => {
    const result = resolveOperation({path: '/state/absent-node'}, present);
    expect(result).toEqual({
      resolved: false,
      unresolvedPath: '/state/absent-node',
      reason: 'unknown-node-id',
    });
  });

  it('rejects a sub-path under an unknown node id', () => {
    const result = resolveOperation({path: '/state/absent-node/page'}, present);
    expect(result).toEqual({
      resolved: false,
      unresolvedPath: '/state/absent-node/page',
      reason: 'unknown-node-id',
    });
  });

  it('rejects the bare /state root with no id', () => {
    const result = resolveOperation({path: '/state'}, present);
    expect(result).toEqual({
      resolved: false,
      unresolvedPath: '/state',
      reason: 'bare-state-root',
    });
  });

  it('rejects a path whose id is a prefix of a present id but not a state root or sub-path', () => {
    // "/state/pagination" is neither statePath("pagination-2") nor beneath it.
    const result = resolveOperation({path: '/state/pagination'}, present);
    expect(result).toEqual({
      resolved: false,
      unresolvedPath: '/state/pagination',
      reason: 'unknown-node-id',
    });
  });
});
