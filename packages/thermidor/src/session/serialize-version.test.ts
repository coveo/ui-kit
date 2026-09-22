import {describe, expect, it} from 'vitest';
import {
  restoreSession,
  SERIALIZED_SESSION_VERSION,
  UnsupportedSerializedSessionVersionError,
  type SerializedSession,
} from './serialize.js';

/**
 * Focused coverage for restoring a serialized session whose `version` is
 * unsupported: it SHALL reject with an unsupported-version error and SHALL NOT
 * partially populate a session.
 */
describe('restoreSession unsupported version', () => {
  function serializedWith(version: unknown): SerializedSession {
    return {
      version,
      sessionId: 'sid',
      sessionToken: 'tok',
      activeTurnId: 't1',
      turns: [
        {
          id: 't1',
          input: {prompt: 'hello'},
          status: 'complete',
          response: {
            activities: [{id: 'a1', kind: 'k', replace: false, payload: {}}],
            state: {a: 1},
          },
        },
      ],
    } as unknown as SerializedSession;
  }

  const unsupportedVersions: Array<{label: string; version: unknown}> = [
    {label: 'zero', version: 0},
    {label: 'a future integer', version: 2},
    {label: 'a far-future integer', version: 999},
    {label: 'a non-integer', version: 1.5},
  ];

  it('sanity: the values under test differ from the supported version', () => {
    for (const {version} of unsupportedVersions) {
      expect(version).not.toBe(SERIALIZED_SESSION_VERSION);
    }
  });

  for (const {label, version} of unsupportedVersions) {
    it(`rejects ${label} (${String(version)}) with an unsupported-version error`, () => {
      expect(() => restoreSession(serializedWith(version))).toThrow(
        UnsupportedSerializedSessionVersionError
      );
    });

    it(`does not partially populate a session for ${label} (${String(version)})`, () => {
      let produced: unknown;
      expect(() => {
        produced = restoreSession(serializedWith(version));
      }).toThrow(UnsupportedSerializedSessionVersionError);

      // The throw is the guarantee: no store state object is ever produced, so
      // no turns/continuity keys leak from a rejected restore.
      expect(produced).toBeUndefined();
    });

    it(`surfaces the offending version on the error for ${label} (${String(version)})`, () => {
      let caught: unknown;
      try {
        restoreSession(serializedWith(version));
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(UnsupportedSerializedSessionVersionError);
      expect((caught as UnsupportedSerializedSessionVersionError).version).toBe(version);
    });
  }
});
