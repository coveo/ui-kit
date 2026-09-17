/**
 * Public-surface type test for the `@coveo/thermidor` package entry.
 *
 * Guards public API independence: the public exports stay free of state-library
 * concepts and form the compile-time surface acceptance gate.
 *
 * POSITIVE assertions (below) confirm the intended session-client surface is
 * exported and usable. NEGATIVE assertions use `@ts-expect-error` on imports of
 * names that MUST NOT be reachable from the entry: each `@ts-expect-error`'d
 * import of a non-exported name only compiles because the name is absent from
 * the public surface, so it fails the typecheck the moment that name leaks into
 * the entry.
 */
import {expectTypeOf, test} from 'vitest';
import {createSession} from '@/src/index.js';
import type {
  RemoteController,
  SerializedSession,
  Session,
  SessionConfig,
  Turn,
  TurnResponse,
} from '@/src/index.js';

// ── POSITIVE: the session-client surface is exported ────────────────────────
test('exposes the createSession session-client surface', () => {
  // `createSession` is exported as a callable value.
  expectTypeOf(createSession).toBeFunction();

  // Key domain / config / serialization / controller types are importable and
  // usable as types from the package entry.
  expectTypeOf<Session<never>>().not.toBeAny();
  expectTypeOf<Turn>().not.toBeAny();
  expectTypeOf<TurnResponse>().not.toBeAny();
  expectTypeOf<SessionConfig<never>>().not.toBeAny();
  expectTypeOf<RemoteController<never, never>>().not.toBeAny();
  expectTypeOf<SerializedSession>().not.toBeAny();
});

/* eslint-disable @typescript-eslint/no-unused-vars */

// ── NEGATIVE: state-library / engine-era concepts are NOT exported ──────────
//
// Each import below names a symbol that exists inside the package but is
// intentionally kept out of the public entry. The `@ts-expect-error` succeeds
// only while the name remains absent from `@/src/index.js`.

// Engine / interface / facade era (no engine, interface, or facade surface).
// @ts-expect-error `Engine` must not be exported from the entry.
import type {Engine} from '@/src/index.js';
// @ts-expect-error `buildUnifiedConverseController` must not be exported.
import {buildUnifiedConverseController} from '@/src/index.js';
// @ts-expect-error `buildGenerativeUnifiedInterface` must not be exported.
import {buildGenerativeUnifiedInterface} from '@/src/index.js';
// @ts-expect-error `AgentResponse` (pre-reshape DTO) must not be exported.
import type {AgentResponse} from '@/src/index.js';

// Internal remote-controller seam.
// @ts-expect-error `buildRemoteController` (legacy value) must not be exported.
import {buildRemoteController} from '@/src/index.js';
// @ts-expect-error `selectRemoteControllerState` must not be exported.
import {selectRemoteControllerState} from '@/src/index.js';
// @ts-expect-error `RemoteControllerSource` must not be exported.
import type {RemoteControllerSource} from '@/src/index.js';

// Redux / state-library concepts (no store, slice, selector, thunk, reducer).
// @ts-expect-error no store type on the public surface.
import type {Store} from '@/src/index.js';
// @ts-expect-error no slice on the public surface.
import {generativeSlice} from '@/src/index.js';
// @ts-expect-error no reducer on the public surface.
import {generativeReducer} from '@/src/index.js';
// @ts-expect-error no selector on the public surface.
import {selectGenerativeState} from '@/src/index.js';
// @ts-expect-error no thunk on the public surface.
import type {GenerativeThunk} from '@/src/index.js';

/* eslint-enable @typescript-eslint/no-unused-vars */
