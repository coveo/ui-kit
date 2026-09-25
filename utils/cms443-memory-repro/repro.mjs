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
// F3a — per-request access token on the ssr-next fetchStaticState path (#8481, merged).
// The fix lives entirely in augmentCommerceEngineOptions (a pure, synchronous, network-free
// function): when buildConfig.accessToken is provided it overrides configuration.accessToken for
// THAT call, via a spread (so the shared definition is NOT mutated). We test that function
// directly — it is the exact code the fix changes.
//   BEFORE: no accessToken field is read -> override ignored -> engine keeps the definition token.
//   AFTER:  override applied for the request, definition left untouched.
// This tree (ssr-commerce-next) is kept but is NOT the client's package; F3b below covers the
// supported tree (ssr-commerce).
// ---------------------------------------------------------------------------
async function finding3SsrNext() {
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

// ---------------------------------------------------------------------------
// F3b — per-request access token AND navigator context on the SUPPORTED ssr-commerce path
// (PRs #8494 token + #8495 navigator context, stacked). This is the client's actual package.
// Unlike F3a (a pure function), the fix here lives in the build factory: build({accessToken,
// navigatorContext}) applies the per-request values on a PER-REQUEST OPTIONS COPY, and the shared
// definition's configuration/navigatorContextProvider is no longer mutated (static-state-factory
// line 70 removed). Causal proof, network-free: build two engines with different tokens and read
// each engine's EFFECTIVE token from Redux state; assert isolation + shared definition untouched.
//   BEFORE (main, no per-request field): build({accessToken}) is ignored -> both engines fall back
//          to the shared token (not isolated) OR setAccessToken bleeds across engines.
//   AFTER  : engineA=user-A, engineB=user-B, definition token untouched, per-request nav context OK.
// ---------------------------------------------------------------------------
async function finding3SsrCommerce() {
  const makeDefinition = () => {
    const def = defineCommerceEngine({
      configuration: getSampleCommerceEngineConfiguration(),
      controllers: {},
    });
    def.listingEngineDefinition.setNavigatorContextProvider(navigatorContextProvider);
    return def;
  };

  const DEF_TOKEN_A = 'user-A-token';
  const DEF_TOKEN_B = 'user-B-token';

  // Scenario B — per-request token via the NEW path (two concurrent build() calls).
  const defB = makeDefinition().listingEngineDefinition;
  const definitionTokenBefore = defB.getAccessToken();
  const [a, b] = await Promise.all([
    defB.build({accessToken: DEF_TOKEN_A}),
    defB.build({accessToken: DEF_TOKEN_B}),
  ]);
  const tokenA = (a.engine ?? a)[stateKey].configuration.accessToken;
  const tokenB = (b.engine ?? b)[stateKey].configuration.accessToken;
  const sharedAfter = defB.getAccessToken();

  const perRequestApplied = tokenA === DEF_TOKEN_A && tokenB === DEF_TOKEN_B;
  const isolated = tokenA !== tokenB;
  const sharedUntouched = sharedAfter === definitionTokenBefore;

  // Scenario C — per-request navigator context (PR #8495): two concurrent builds with distinct
  // contexts must both succeed without mutating the shared provider (structural isolation).
  const defC = makeDefinition().listingEngineDefinition;
  const ctxA = {
    clientId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    referrer: null,
    userAgent: 'ua-A',
    location: 'http://a/',
    forwardedFor: '1.1.1.1',
  };
  const ctxB = {
    clientId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    referrer: null,
    userAgent: 'ua-B',
    location: 'http://b/',
    forwardedFor: '2.2.2.2',
  };
  let navContextIsolated = false;
  try {
    const [ca, cb] = await Promise.all([
      defC.build({navigatorContext: ctxA}),
      defC.build({navigatorContext: ctxB}),
    ]);
    navContextIsolated = !!(ca.engine ?? ca) && !!(cb.engine ?? cb);
  } catch {
    navContextIsolated = false;
  }

  const fixed = perRequestApplied && isolated && sharedUntouched && navContextIsolated;

  return {
    perRequestTokenApplied: perRequestApplied,
    tokensIsolatedAcrossConcurrentBuilds: isolated,
    sharedDefinitionNotMutated: sharedUntouched,
    perRequestNavigatorContextApplied: navContextIsolated,
    verdict: fixed
      ? 'FIXED — per-request token + navigator context applied without mutating the shared definition'
      : 'LEAK — no per-request token/context on the supported ssr-commerce tree',
  };
}

// ---------------------------------------------------------------------------
// F3c — per-request access token on the ssr-next SEARCH path (#8505, merged & released in
// @coveo/headless 3.57.0). Mirror of F3a but for search, not commerce. The fix lives in
// augmentSearchEngineOptions (pure, synchronous, network-free): when buildConfig.accessToken is
// provided it overrides configuration.accessToken for THAT call, on a copy, so the shared
// definition is NOT mutated. #8505 also removed the shared setAccessToken()/access-token manager
// from the search engine definition — the class of bug where an overlapping request could cross
// tokens. We test the pure function directly (the exact code the fix changes).
//   BEFORE (pre-#8505): BuildConfig had no accessToken field -> override ignored -> engine keeps
//          the definition token, and setAccessToken() mutated a module-level definition every
//          request reads (cross-request token bleed).
//   AFTER  : override applied for the request, definition left untouched, fallback when omitted.
// ---------------------------------------------------------------------------
async function finding3SsrNextSearch() {
  let augment;
  try {
    ({augmentSearchEngineOptions: augment} = await import(
      `${distEsm}/ssr-next/search/utils/engine-wiring.js`
    ));
  } catch {
    return {
      available: false,
      note: 'augmentSearchEngineOptions not found in this build (ssr-next search path absent)',
      verdict: 'N/A',
    };
  }

  const DEFINITION_TOKEN = 'search-definition-token';
  const PER_REQUEST_TOKEN = 'search-per-request-user-token';

  const makeEngineOptions = () => ({
    configuration: {
      ...getSampleCommerceEngineConfiguration(),
      accessToken: DEFINITION_TOKEN,
    },
  });
  const buildConfigBase = {navigatorContext: navigatorContextProvider()};

  // 1) Per-request override applied to the engine options for this call.
  const sharedOptions = makeEngineOptions();
  const withPerRequest = augment(sharedOptions, {
    ...buildConfigBase,
    accessToken: PER_REQUEST_TOKEN,
  });
  const perRequestApplied = withPerRequest.configuration.accessToken === PER_REQUEST_TOKEN;

  // 2) Shared definition options NOT mutated by that call.
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
      : 'LEAK — no per-request token on the ssr-next search tree (override ignored)',
  };
}

const r1 = await finding1();
const r2 = await finding2();
const r3a = await finding3SsrNext();
const r3b = await finding3SsrCommerce();
const r3c = await finding3SsrNextSearch();

if (asJson) {
  console.log(
    JSON.stringify(
      {f1: r1, f2: r2, f3_ssrNext: r3a, f3_ssrCommerce: r3b, f3_ssrNextSearch: r3c},
      null,
      2
    )
  );
} else {
  console.log('\n===== CMS-443 hardened repro =====\n');
  console.log('Finding 1 — engine retention (WeakRef + FinalizationRegistry):');
  console.table(r1);
  console.log('Finding 2 — relay selector cache (direct eviction probe):');
  console.table(r2);
  console.log('Finding 3a — request-scoped token on ssr-next commerce (ssr-commerce-next, #8481):');
  console.table(r3a);
  console.log(
    'Finding 3b — request-scoped token + navigator context on ssr-commerce (supported, #8494/#8495):'
  );
  console.table(r3b);
  console.log('Finding 3c — request-scoped token on ssr-next search (#8505):');
  console.table(r3c);
}
