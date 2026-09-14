/**
 * CMS-443 — hardened reproduction / validation of the three SSR-commerce memory findings.
 *
 * Measures against a BUILT @coveo/headless, whose dist/esm directory is passed as argv[2].
 * The orchestrator (compare.sh) checks out each ref, builds headless, and runs this once per ref.
 *
 * Usage:
 *   node --expose-gc repro.mjs /abs/path/to/packages/headless/dist/esm [--json]
 *
 * No network I/O. Proof strategy per finding:
 *   F1 — causal: WeakRef survival + FinalizationRegistry finalization count after forced GC.
 *   F2 — direct: call the relay selector with N distinct tokens, then re-probe the oldest
 *        token; a cache HIT (same instance) proves the entry was NOT evicted (unbounded, before);
 *        a MISS (new instance) proves eviction (bounded LRU, after).
 *   F3 — behavioural: is a per-request accessToken supported by fetchStaticState WITHOUT
 *        mutating the shared definition?
 */

if (typeof global.gc !== 'function') {
  console.error('Run with --expose-gc');
  process.exit(1);
}

const distEsm = process.argv[2];
const asJson = process.argv.includes('--json');
if (!distEsm) {
  console.error('Missing dist/esm path as argv[2]');
  process.exit(1);
}

const {defineCommerceEngine, getSampleCommerceEngineConfiguration} = await import(
  `${distEsm}/ssr-commerce.index.js`
);
const {getRelayInstanceFromState} = await import(
  `${distEsm}/api/analytics/analytics-relay-client.js`
);
const {stateKey} = await import(`${distEsm}/app/state-key.js`);

const ITER = 500;
const RELAY_CACHE_MAX = 50; // fix caps the relay selector at this many entries

const MB = (b) => (b / 1024 / 1024).toFixed(1);
const KB = (b) => (b / 1024).toFixed(2);
const heap = () => process.memoryUsage().heapUsed;
const settle = async () => {
  global.gc();
  await new Promise((r) => setTimeout(r, 0));
  global.gc();
  await new Promise((r) => setTimeout(r, 0));
};

const navigatorContextProvider = () => ({
  clientId: '00000000-0000-0000-0000-000000000000',
  location: 'https://example.com',
  referrer: 'https://example.com',
  userAgent: 'repro',
  forwardedFor: '127.0.0.1',
});

// ---------------------------------------------------------------------------
// F1 — engine retention. Causal proof via WeakRef + FinalizationRegistry, plus a
// non-regression check on the live hydrated engine.
// A single module-level definition (as documented) registers a token-update callback for every
// engine it builds. The fix makes that registry WEAK, so the GC releases the subscription once
// the engine is unreachable — fixing every path without dropping updates for live engines.
//   F1a — fetchStaticState (default server path): retained heap after forced GC. Engine not
//         exposed here, so heap growth is the signal. BEFORE: linear; AFTER: flat.
//   F1b — build() (engine exposed): causal WeakRef + FinalizationRegistry count. BEFORE (strong
//         Set): 0 collected / all retained. AFTER (weak): all collected.
//   F1c — hydrateStaticState non-regression: a LIVE engine (as the browser keeps in useState)
//         must still receive a later setAccessToken. BEFORE/AFTER(weak): propagated.
//         The option-A skip-registration approach REGRESSED this (stale token).
// ---------------------------------------------------------------------------
async function finding1() {
  // --- F1a: the DEFAULT server path, fetchStaticState. The engine is NOT exposed here, so we
  // measure retained heap after a forced full GC: BEFORE the fix each call registers a callback
  // that retains the engine -> linear growth; AFTER nothing is retained -> flat.
  const defA = defineCommerceEngine({configuration: getSampleCommerceEngineConfiguration()});
  defA.standaloneEngineDefinition.setNavigatorContextProvider(navigatorContextProvider);

  await settle();
  const beforeHeap = heap();
  for (let i = 0; i < ITER; i++) {
    try {
      await defA.standaloneEngineDefinition.fetchStaticState();
    } catch {
      // Expected network rejection; engine construction + (pre-fix) registration already happened.
    }
  }
  await settle();
  const afterHeap = heap();
  const fetchPerIterKB = (afterHeap - beforeHeap) / ITER / 1024;

  // --- F1b: build() exposes the engine. Causal proof via WeakRef + FinalizationRegistry.
  // BEFORE (strong Set): the registry retains every engine -> 0 finalized. AFTER (weak registry):
  // the GC reclaims each engine once the loop drops its reference -> all finalized.
  const defB = defineCommerceEngine({configuration: getSampleCommerceEngineConfiguration()});
  defB.standaloneEngineDefinition.setNavigatorContextProvider(navigatorContextProvider);

  let finalized = 0;
  const registry = new FinalizationRegistry(() => {
    finalized++;
  });
  await settle();
  const refs = [];
  for (let i = 0; i < ITER; i++) {
    const {engine} = await defB.standaloneEngineDefinition.build();
    registry.register(engine, i);
    refs.push(new WeakRef(engine));
  }
  await settle();
  const aliveByWeakRef = refs.filter((w) => w.deref() !== undefined).length;

  // --- F1c: non-regression. Hydrate a live engine (kept referenced, as the browser provider does
  // via useState), rotate the token, and read the engine's EFFECTIVE token from Redux state. The
  // weak registry must still propagate it; the skip-registration approach left it stale.
  const defC = defineCommerceEngine({configuration: getSampleCommerceEngineConfiguration()});
  defC.standaloneEngineDefinition.setNavigatorContextProvider(navigatorContextProvider);
  const {engine: liveEngine} = await defC.standaloneEngineDefinition.hydrateStaticState({
    searchActions: [],
    navigatorContext: navigatorContextProvider(),
  });
  const tokenBeforeRotation = liveEngine[stateKey].configuration.accessToken;
  defC.standaloneEngineDefinition.setAccessToken('rotated-token');
  const tokenAfterRotation = liveEngine[stateKey].configuration.accessToken;
  const liveEngineReceivedRotatedToken = tokenAfterRotation === 'rotated-token';

  const LEAK_THRESHOLD_KB = 5; // a released engine leaves ~0; a retained one is tens of KB
  const fetchPathLeaks = fetchPerIterKB > LEAK_THRESHOLD_KB;
  // Use the WeakRef 'alive' count as the causal signal: it is deterministic right after a forced
  // GC, whereas FinalizationRegistry finalizers may not have been scheduled yet (spec allows it).
  // A single lingering engine (the last one still referenced at GC time) is a measurement artifact,
  // not a leak, so allow a small slack.
  const buildRetained = aliveByWeakRef > 1;
  const hydrateRegressed = !liveEngineReceivedRotatedToken;

  let verdict;
  if (fetchPathLeaks || buildRetained) {
    verdict = `LEAK — fetchStaticState ~${fetchPerIterKB.toFixed(1)} KB/call, build alive ${aliveByWeakRef}/${ITER}`;
  } else if (hydrateRegressed) {
    verdict = 'REGRESSION — hydrated live engine did not receive the rotated token';
  } else {
    verdict = 'FIXED — all paths released, live hydrated engine still updated';
  }

  return {
    iterations: ITER,
    fetchStaticState_perIterKB: fetchPerIterKB.toFixed(2),
    fetchStaticState_totalMB: MB(afterHeap - beforeHeap),
    build_enginesStillAlive: aliveByWeakRef,
    build_enginesFinalized: finalized,
    hydrate_liveEngineReceivedRotatedToken: liveEngineReceivedRotatedToken,
    verdict,
  };
}

// ---------------------------------------------------------------------------
// F2 — relay selector cache, DIRECT measurement.
// Call the selector with N distinct tokens (each a distinct primitive key), then re-probe
// the FIRST token. Before: weakMapMemoize never evicts primitive keys → re-probe returns the
// SAME instance (cache hit) → unbounded. After: lruMemoize(maxSize=RELAY_CACHE_MAX) evicted it
// → re-probe returns a NEW instance (cache miss). We also assert a repeated token is a hit
// within the window (memoization still works).
// ---------------------------------------------------------------------------
function makeStateFactory(referenceState) {
  // Clone the real engine state, varying only accessToken — the selector's primitive key.
  return (token) => ({
    ...referenceState,
    configuration: {...referenceState.configuration, accessToken: token},
  });
}

async function finding2() {
  const ncp = navigatorContextProvider;

  // Build one real engine to capture a valid reference state (with a proper analytics.source).
  const {standaloneEngineDefinition} = defineCommerceEngine({
    configuration: getSampleCommerceEngineConfiguration(),
  });
  standaloneEngineDefinition.setNavigatorContextProvider(ncp);
  const {engine} = await standaloneEngineDefinition.build();
  const referenceState = engine[stateKey];
  const makeState = makeStateFactory(referenceState);

  // 1) Memoization still works: same token twice in a row -> same instance.
  const t0 = 'token-0';
  const a = getRelayInstanceFromState(makeState(t0), ncp);
  const b = getRelayInstanceFromState(makeState(t0), ncp);
  const memoizationWorks = a === b;

  // Capture the very first instance for the eviction probe.
  const firstToken = 'token-evict-probe';
  const firstInstance = getRelayInstanceFromState(makeState(firstToken), ncp);

  // 2) Flood with distinct tokens (more than the LRU window).
  for (let i = 0; i < ITER; i++) {
    getRelayInstanceFromState(makeState(`token-${i}-${'x'.repeat(32)}`), ncp);
  }

  // 3) Re-probe the first token. Hit (same instance) => never evicted (unbounded/before).
  //    Miss (new instance) => evicted (bounded LRU/after).
  const reprobe = getRelayInstanceFromState(makeState(firstToken), ncp);
  const firstStillCached = reprobe === firstInstance;

  return {
    distinctTokens: ITER,
    memoizationWorks,
    firstTokenStillCachedAfterFlood: firstStillCached,
    lruCapAssumed: RELAY_CACHE_MAX,
    verdict: firstStillCached
      ? 'LEAK — oldest entry never evicted (unbounded cache)'
      : 'FIXED — oldest entry evicted (bounded cache)',
  };
}

// ---------------------------------------------------------------------------
// F3 — per-request access token on the ssr-next fetchStaticState path.
// The fix lives entirely in augmentCommerceEngineOptions (a pure, synchronous, network-free
// function): when buildConfig.accessToken is provided it overrides configuration.accessToken for
// THAT call, via a spread (so the shared definition is NOT mutated). We test that function
// directly — it is the exact code the fix changes.
//   BEFORE: no accessToken field is read -> override ignored -> engine keeps the definition token.
//   AFTER:  override applied for the request, definition left untouched.
// ---------------------------------------------------------------------------
async function finding3() {
  let augment;
  try {
    ({augmentCommerceEngineOptions: augment} = await import(
      `${distEsm}/ssr-next/commerce/utils/engine-wiring.js`
    ));
  } catch {
    return {
      available: false,
      note: 'augmentCommerceEngineOptions not found in this build (ssr-next path absent)',
      verdict: 'N/A',
    };
  }

  const DEFINITION_TOKEN = 'definition-shared-token';
  const PER_REQUEST_TOKEN = 'per-request-user-token';

  // A shared engine definition config (as a module-level singleton would hold).
  const makeEngineOptions = () => ({
    configuration: {
      ...getSampleCommerceEngineConfiguration(),
      accessToken: DEFINITION_TOKEN,
    },
  });
  const buildConfigBase = {
    navigatorContext: navigatorContextProvider(),
    context: {},
  };

  // 1) Per-request override: passing accessToken should produce an engine config carrying it.
  const sharedOptions = makeEngineOptions();
  const withPerRequest = augment(sharedOptions, {
    ...buildConfigBase,
    accessToken: PER_REQUEST_TOKEN,
  });
  const perRequestApplied = withPerRequest.configuration.accessToken === PER_REQUEST_TOKEN;

  // 2) Shared definition NOT mutated by that call (no cross-request bleed under concurrency).
  const sharedNotMutated = sharedOptions.configuration.accessToken === DEFINITION_TOKEN;

  // 3) Omitting accessToken falls back to the definition's token.
  const withoutPerRequest = augment(makeEngineOptions(), {...buildConfigBase});
  const fallbackToDefinition = withoutPerRequest.configuration.accessToken === DEFINITION_TOKEN;

  const fixed = perRequestApplied && sharedNotMutated && fallbackToDefinition;

  return {
    available: true,
    perRequestTokenApplied: perRequestApplied,
    sharedDefinitionNotMutated: sharedNotMutated,
    fallbackToDefinitionWhenOmitted: fallbackToDefinition,
    verdict: fixed
      ? 'FIXED — per-request token applied without mutating the shared definition'
      : 'LEAK — no per-request token (override ignored)',
  };
}

const r1 = await finding1();
const r2 = await finding2();
const r3 = await finding3();

if (asJson) {
  console.log(JSON.stringify({f1: r1, f2: r2, f3: r3}, null, 2));
} else {
  console.log('\n===== CMS-443 hardened repro =====\n');
  console.log('Finding 1 — engine retention (WeakRef + FinalizationRegistry):');
  console.table(r1);
  console.log('Finding 2 — relay selector cache (direct eviction probe):');
  console.table(r2);
  console.log('Finding 3 — request-scoped token on a shared definition:');
  console.table(r3);
}
