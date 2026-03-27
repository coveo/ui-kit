# Frankenstein Engine: Unified Search & Commerce Engine Spec & Implementation Plan

> **Reference**: This spec productizes patterns from the [Dual-Engine Commerce & Knowledge Search Confluence cookbook](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6088392726/Dual-Engine+Commerce+Knowledge+Search+Frontend+Patterns) and [dual-engine sample repository](https://github.com/Coveo-Incubator/dual-engine-search-sample).

## Executive Summary

**Goal**: Create a new "Frankenstein Engine" that combines Search and Commerce capabilities into a single unified engine, allowing developers to use both search and commerce controllers simultaneously while supporting intent-based routing.

**Scope**:
- ✅ New NPM entrypoint: `@coveo/headless/frankenstein`
- ✅ Support intent-based branching in controllers
- ❌ Scope out CDN support (defer to later)
- ❌ Intent detection (no solution, punted)

**User Experience**:
```typescript
import {buildFrankensteinEngine, buildSearchBox} from '@coveo/headless/frankenstein'
import {buildNumericFacet} from '@coveo/headless/search'
import {buildProductSuggestions} from '@coveo/headless/commerce'

const engine = buildFrankensteinEngine({...});
const searchBox = buildSearchBox(engine);
const numericFacet = buildNumericFacet(engine);
const productSuggestions = buildProductSuggestions(engine);
```

## Architecture Overview

### 1. Engine Marker System

**Purpose**: Distinguish between Commerce, Search/Knowledge, and Frankenstein engines internally.

**Implementation**:
- Use Symbol-based marker (similar to `stateKey`)
- Three marker values: `'search'`, `'commerce'`, `'frankenstein'`
- Marker injected during engine build, accessible only within package via Symbol
- Location: `packages/headless/src/app/engine-marker.ts`

**Files to modify**:
- New: `src/app/engine-marker.ts` - Define marker Symbol and values
- Modify: `src/app/engine.ts` - `buildEngine` receives marker, stores it
- Modify: `src/app/search-engine/search-engine.ts` - Pass `'search'` marker
- Modify: `src/app/commerce-engine/commerce-engine.ts` - Pass `'commerce'` marker

### 2. Frankenstein Engine

**Type**: `FrankensteinEngine extends CoreEngineNext`

**Sub-engines**:
- Internal SearchEngine instance (via Symbol `searchEngineKey`)
- Internal CommerceEngine instance (via Symbol `commerceEngineKey`)
- Friend-only access within package, not exposed to consumers

**API Surface**:
- Core engine methods: `dispatch`, `subscribe`, `addReducers`, `enableAnalytics`, `disableAnalytics`
- Configuration accessors: `configuration`, `logger`, `relay`, `navigatorContext`
- Common methods that exist in both (if any)
- **Does NOT expose**: `executeFirstSearch`, search-specific or commerce-specific methods

**State Management**:
- Each sub-engine maintains its own independent Redux store
- Search engine has its own state (search reducers)
- Commerce engine has its own state (commerce reducers)
- NO state merging - controllers access their respective sub-engine's state
- Frankenstein engine itself does not expose a combined state

**Configuration**:
```typescript
interface FrankensteinEngineConfiguration {
  // Shared config
  organizationId: string;
  accessToken: string;
  renewAccessToken?: () => Promise<string>;
  preprocessRequest?: PreprocessRequest;
  name?: string;
  analytics?: AnalyticsConfiguration;
  environment?: PlatformEnvironment;
  
  // Search-specific
  search?: SearchEngineConfiguration['search'];
  
  // Commerce-specific (required parts)
  commerce: {
    context: ContextOptions;
    cart?: CartInitialState;
    proxyBaseUrl?: string;
  };
}
```

**Implementation Location**: `packages/headless/src/app/frankenstein-engine/frankenstein-engine.ts`

### 3. Controller Support Engine System

**Core Concept**: Controllers declare which engine types they support.

**Support Matrix**:
| Controller Type | Supports Search | Supports Commerce | Supports Frankenstein |
|----------------|----------------|-------------------|----------------------|
| Search controllers | ✅ | ❌ | ✅ (uses search sub-engine) |
| Commerce controllers | ❌ | ✅ | ✅ (uses commerce sub-engine) |
| Frankenstein controllers | ❌ | ❌ | ✅ (wraps both) |

**Implementation**:
- Modify `buildController` function to receive `supportedEngines` parameter
- Type: `SupportedEngine[] = ['search'] | ['commerce'] | ['search', 'frankenstein'] | ['commerce', 'frankenstein'] | ['frankenstein']`
- Add runtime validation: throw error if controller built with incompatible engine
- Route to appropriate sub-engine when Frankenstein engine provided

**Location**: `packages/headless/src/controllers/controller/headless-controller.ts`

### 4. Intent-Based Branching

**Mechanism**: Controller methods accept optional intent parameter for selective submission.

**Example**:
```typescript
// Submit both engines (default dual-engine behavior)
searchBox.submit();
searchBox.submit({intent: 'both'});

// Selective submit - search only (saves 1 QPM)
searchBox.submit({intent: 'search'});

// Selective submit - commerce only (saves 1 QPM)
searchBox.submit({intent: 'commerce'});
```

**Implementation**:
- Frankenstein controllers expose methods with optional `intent` parameter
- Intent values: `'search' | 'commerce' | 'both'`
- Default: `'both'` (queries both engines, 2 QPM, update each sub-engine state)
- Intent detection is **out of scope** - consumers implement their own strategies

**Note**: Intent detection patterns (suggestion counts, facet field lookups, result counts, unified signals) are documented in the Confluence cookbook but are **not** part of Frankenstein. Consumers implement these patterns externally and pass the detected intent to Frankenstein controllers.

### 5. Frankenstein-Only Controllers

**Purpose**: Controllers that compose both search and commerce functionality.

**Pattern**: Wrapper controllers that:
- Accept only `FrankensteinEngine`
- Internally build both search and commerce variants
- Expose unified interface with intent routing
- Example: Unified searchbox, unified facet manager

**Example - Unified SearchBox**:
```typescript
export function buildSearchBox(
  engine: FrankensteinEngine,
  props?: SearchBoxProps
): FrankensteinSearchBox {
  const searchSearchBox = buildSearchSearchBox(engine[searchEngineKey], props);
  const commerceSearchBox = buildCommerceSearchBox(engine[commerceEngineKey], props);
  
  return {
    updateText(value: string) {
      searchSearchBox.updateText(value);
      commerceSearchBox.updateText(value);
    },
    submit(options?: {intent?: 'search' | 'commerce'}) {
      const intent = options?.intent ?? 'search'; // default
      if (intent === 'search') {
        searchSearchBox.submit();
      } else {
        commerceSearchBox.submit();
      }
    },
    get state() {
      // Return appropriate sub-controller state based on context and the state of both sub-controllers
    },
  };
}
```

**Location**: `packages/headless/src/controllers/frankenstein/`

### 6. URL Manager Integration

**Challenge**: Both search and commerce URL managers serialize state using the same parameter names (`q`, `f-{field}`, `page`, `sortCriteria`), causing collisions in a shared URL hash.

**Solution**: Provide URL manager utilities that namespace parameters with prefixes.

**Pattern**:
```typescript
import {buildUrlManager} from '@coveo/headless';
import {buildFrankensteinUrlManagerWrapper} from '@coveo/headless/frankenstein';

const searchUrlManager = buildUrlManager(searchEngine, {
  initialState: {fragment: initialFragments.search},
});
const commerceUrlManager = commerceSearch.urlManager({
  initialState: {fragment: initialFragments.commerce},
});

// Wrapper handles prefixing (s. and c.), merging, and popstate
const wrapper = buildFrankensteinUrlManagerWrapper({
  searchUrlManager,
  commerceUrlManager,
  searchPrefix: 's.',
  commercePrefix: 'c.',
});

// Result: #s.q=shoes&s.f-source=Web&c.q=shoes&c.f-ec_brand=Nike&c.page=2
```

**Implementation**:
- Parse initial hash before constructing engines (critical timing)
- Subscribe to both URL managers, merge prefixed fragments, push to history
- Handle popstate: split by prefix, call `synchronize()` on each manager
- Use `synchronizing` flag to prevent re-entrant writes
- `lastHash` check to avoid duplicate history entries

**Location**: `packages/headless/src/controllers/frankenstein/url-manager/`

### 7. Entry Point Structure

**New Entry Point**: `@coveo/headless/frankenstein`

**Package.json Export**:
```json
{
  "exports": {
    "./frankenstein": {
      "types": "./dist/definitions/frankenstein.index.d.ts",
      "import": "./dist/esm/frankenstein.index.js",
      "require": "./dist/cjs/frankenstein/headless.cjs",
      "default": "./dist/esm/frankenstein.index.js"
    }
  }
}
```

**Index File**: `packages/headless/src/frankenstein.index.ts`

**Exports**:
- Engine: `buildFrankensteinEngine`, `FrankensteinEngine`, `FrankensteinEngineConfiguration`
- Frankenstein controllers:
  * `buildSearchBox` - Unified searchbox with intent-based submission
  * `buildInstantResults` - Wraps both instant products and instant results
  * `buildFrankensteinUrlManagerWrapper` - URL parameter namespacing utility
- Utilities:
  * `mergeSuggestions` - Deduplicates and prioritizes suggestions
  * Search/Commerce engine accessors (for advanced use cases)
- Types: `FrankensteinSearchBox`, `Intent`, etc.

## Implementation Plan

### Phase 1: Foundation (Engine Marker & Support System)

**Goal**: Establish the marker system and controller support infrastructure.

1. **Create engine marker system**
   - Create `src/app/engine-marker.ts` with Symbol and enum
   - Add marker to `CoreEngine` interface (internal Symbol property)
   - Modify `buildEngine` to accept and store marker

2. **Update existing engines to use markers**
   - Modify `buildSearchEngine` to pass `'search'` marker
   - Modify `buildCommerceEngine` to pass `'commerce'` marker
   - Note: `buildRecommendationEngine`, `buildInsightEngine`, and `buildCaseAssistEngine` are **not** supported by the Frankenstein engine and do not receive markers

3. **Enhance buildController with support engine validation** (*parallel with step 2*)
   - Add `SupportedEngine` type
   - Add `supportedEngines` parameter to `buildController`
   - Implement engine type detection using marker
   - Add runtime validation with helpful error messages
   - Add sub-engine routing logic for Frankenstein engines (stub for now)

4. **Verification**
   - Existing tests pass (no behavioral changes yet)
   - Marker correctly set in all engines
   - Engine type detection works

### Phase 2: Frankenstein Engine Implementation

**Goal**: Build the Frankenstein engine that combines search and commerce.

5. **Create Frankenstein engine builder**
   - Create `src/app/frankenstein-engine/` directory
   - Create configuration types: `FrankensteinEngineConfiguration`
   - Create configuration schema validation
   - Implement `buildFrankensteinEngine` function:
     * Build search engine with search config (creates its own Redux store)
     * Build commerce engine with commerce config (creates its own Redux store)
     * Store sub-engines via Symbols (each with independent state)
     * Set marker to `'frankenstein'`
     * Use `redactEngine` to hide internal state
     * Return `FrankensteinEngine` interface

6. **Create sub-engine accessor utilities** (*parallel with step 5*)
   - Create Symbol keys: `searchEngineKey`, `commerceEngineKey`
   - Create internal utility functions:
     * `getSearchEngine(engine: FrankensteinEngine): SearchEngine`
     * `getCommerceEngine(engine: FrankensteinEngine): CommerceEngine`
   - Location: `src/app/frankenstein-engine/frankenstein-engine-utils.ts`

7. **Update buildController to route to sub-engines**
   - Implement sub-engine selection when Frankenstein engine detected
   - Pass appropriate sub-engine to controller based on `supportedEngines` declaration

8. **Verification**
   - Frankenstein engine builds successfully
   - Sub-engines are created and accessible internally
   - Each sub-engine has its own independent Redux store
   - Configuration validation works

### Phase 3: Enable Existing Controllers

**Goal**: Make existing search and commerce controllers work with Frankenstein engine.

9. **Update all search controllers to support Frankenstein**
   - Modify each search controller builder to declare supported engines
   - Pattern: Each `buildXController` calls `buildController(engine, {supportedEngines: ['search', 'frankenstein']})`
   - Affected files: All in `src/controllers/` (except commerce subdirectory)
   - Can be done in batches or parallel per controller

10. **Update all commerce controllers to support Frankenstein** (*parallel with step 9*)
    - Modify each commerce controller builder to declare supported engines
    - Pattern: Each `buildXController` calls `buildController(engine, {supportedEngines: ['commerce', 'frankenstein']})`
    - Affected files: All in `src/controllers/commerce/`

11. **Update controller type signatures**
    - Search controllers: Accept `SearchEngine | FrankensteinEngine`
    - Commerce controllers: Accept `CommerceEngine | FrankensteinEngine`

12. **Verification**
    - Search controllers work with both SearchEngine and FrankensteinEngine
    - Commerce controllers work with both CommerceEngine and FrankensteinEngine
    - Type checking enforces correct engine usage
    - Existing unit tests updated and passing

### Phase 4: Frankenstein-Specific Controllers

**Goal**: Create wrapper controllers that unify search and commerce functionality.

13. **Create Frankenstein controller infrastructure**
    - Create `src/controllers/frankenstein/` directory
    - Define common patterns for wrapper controllers
    - Define intent routing utilities

14. **Implement Frankenstein SearchBox** (*depends on step 13*)
    - Create unified searchbox that wraps both variants
    - Support intent parameter in `submit` method
    - Expose frankenstein-ed controller state from both sub-controllers
    - Location: `src/controllers/frankenstein/search-box/headless-frankenstein-search-box.ts`

15. **Implement other Frankenstein controllers** (*parallel, depends on step 13*)
    - Identify which controllers need Frankenstein variants:
      * **InstantResults wrapper** - Wraps both `buildInstantProducts` and `buildInstantResults`, updates both on query change, merges results
      * **URL Manager wrapper** - Critical for avoiding parameter collisions (see section 6)
      * **Suggestion merger utility** - Deduplicates suggestions by `rawValue.toLowerCase().trim()`, prioritizes shared suggestions
    - Optional wrappers (lower priority):
      * Facet Generator (note: facets typically shown per-tab, not unified)
      * Pagination (note: each engine maintains independent page state)
    - Implement each following the wrapper pattern
    - **Not included**: GenAI wrapper (search-only feature), Analytics wrappers (incompatible APIs)

16. **Verification**
    - Frankenstein controllers only accept FrankensteinEngine
    - Intent routing works correctly
    - Controllers coordinate both sub-engines properly

### Phase 5: Entry Point & Exports

**Goal**: Set up the new `/frankenstein` entry point with proper exports.

17. **Create Frankenstein index file**
    - Create `src/frankenstein.index.ts`
    - Export `buildFrankensteinEngine` and types
    - Export Frankenstein-specific controllers from `controllers/frankenstein/`
    - Export relevant shared types and utilities
    - Add documentation comments

18. **Update package.json exports** (*depends on step 17*)
    - Add `/frankenstein` entry point
    - Configure TypeScript definitions path
    - Configure ESM and CJS bundle paths

19. **Update build configuration**
    - Update `esbuild.mjs` to build Frankenstein bundle
    - Update `tsconfig.build-esm.json` if needed
    - Update TypeDoc configuration to document Frankenstein exports
    - Add new typedoc config: `typedoc-configs/frankenstein.typedoc.json`

20. **Verification**
    - `import {buildFrankensteinEngine} from '@coveo/headless/frankenstein'` works
    - TypeScript types are correctly exported
    - ESM, CJS, and type definitions are generated
    - Documentation builds successfully

### Phase 6: Testing & Documentation

**Goal**: Ensure quality and provide documentation.

21. **Write unit tests**
    - Engine marker system tests
    - Frankenstein engine builder tests
    - Sub-engine routing tests
    - Controller support engine validation tests
    - Frankenstein controller tests (each wrapper)
    - Location: Follow existing test patterns in `src/**/*.test.ts`

22. **Write integration tests** (*parallel with step 21*)
    - End-to-end scenarios using Frankenstein engine
    - Mix of search and commerce controllers
    - Intent-based branching scenarios
    - Location: `src/integration-tests/frankenstein/`

23. **Update documentation**
    - Add usage guide for Frankenstein engine
    - Document intent-based branching pattern
    - Provide migration examples
    - Update API reference (TypeDoc will auto-generate)
    - Location: Consider `packages/headless/source_docs/` or separate documentation

24. **Create sample application** (*optional, parallel*)
    - Create sample in `samples/headless/frankenstein/`
    - Demonstrate unified search and commerce
    - Show intent routing in action

25. **Verification**
    - All tests pass (`pnpm run test`)
    - Integration tests cover key scenarios
    - Documentation is clear and accurate
    - Sample app demonstrates the feature

## Critical Files Summary

### New Files
- `src/app/engine-marker.ts` - Symbol-based marker system
- `src/app/frankenstein-engine/frankenstein-engine.ts` - Main engine builder
- `src/app/frankenstein-engine/frankenstein-engine-configuration.ts` - Configuration types & validation
- `src/app/frankenstein-engine/frankenstein-engine-utils.ts` - Sub-engine accessors
- `src/frankenstein.index.ts` - Entry point exports
- `src/controllers/frankenstein/search-box/headless-frankenstein-search-box.ts` - Unified searchbox with intent submission
- `src/controllers/frankenstein/instant-results/headless-frankenstein-instant-results.ts` - Unified instant products + instant results
- `src/controllers/frankenstein/url-manager/headless-frankenstein-url-manager-wrapper.ts` - URL parameter namespacing
- `src/controllers/frankenstein/utils/suggestions.ts` - Suggestion merging utilities
- (Additional Frankenstein controller files as needed)

### Modified Files
- `src/app/engine.ts` - Add marker support to buildEngine
- `src/app/search-engine/search-engine.ts` - Pass search marker
- `src/app/commerce-engine/commerce-engine.ts` - Pass commerce marker
- `src/controllers/controller/headless-controller.ts` - Add supportedEngines parameter & routing
- All search controller builders in `src/controllers/` - Declare support for Frankenstein
- All commerce controller builders in `src/controllers/commerce/` - Declare support for Frankenstein
- `package.json` - Add /frankenstein export
- Build configuration files (`esbuild.mjs`, etc.)

## Decision Log

1. **Engine marker via Symbol**: Chosen for consistency with existing `stateKey` pattern and internal-only access
2. **Knowledge = Search**: No separate Knowledge engine; Knowledge is an alias for Search engine
3. **Frankenstein API surface**: Core methods + configuration + common methods only; no engine-specific methods exposed
4. **Sub-engine access**: Symbol-based internal access only; not exposed to consumers for encapsulation
5. **Intent branching**: Optional parameter on controller methods with three values: `'search'`, `'commerce'`, `'both'` (default)
6. **Frankenstein controllers**: Wrapper pattern that composes existing search and commerce controllers
7. **Controller supportEngine**: Internal parameter in `buildController` function, with runtime validation and sub-engine routing
8. **Query synchronization**: `updateText` always updates both engines (necessary for suggestions and instant results)
9. **Default submission behavior**: `submit()` queries both engines by default (2 QPM); selective submission is opt-in via `intent` parameter
10. **URL manager integration**: Namespaced parameters (s. and c. prefixes) to avoid collisions, provided as wrapper utility

## Key Patterns from Confluence Cookbook

These patterns from the dual-engine cookbook should guide implementation:

1. **Lazy singleton engines**: Each engine is created once and reused, not recreated per component
2. **Query synchronization**: `updateText` on both engines for every keystroke to ensure suggestions work
3. **Suggestion merging**: Deduplicate by `rawValue.toLowerCase().trim()`, prioritize shared suggestions
4. **Independent pagination**: Each engine maintains its own page state; no cross-engine pagination
5. **Tab-specific facets**: Facets only shown on engine-specific tabs, not unified
6. **URL manager namespacing**: Critical pattern to avoid parameter collisions using prefixes
7. **Instant results coordination**: Both `updateQuery` and `handleSuggestionHover` update both controllers
8. **Separate analytics**: Different APIs cannot be unified; each engine requires its own click handlers
9. **GenAI display strategy**: Show RGA answer on all tabs even though it's search-only
11. **Intent detection is external**: Frankenstein enables the selective submit pattern but doesn't implement detection algorithms

## Scope Clarifications

**In Scope**:
- ✅ NPM package entry point (`@coveo/headless/frankenstein`)
- ✅ Unified engine combining search and commerce
- ✅ Intent-based branching in controller methods
- ✅ Support for existing search controllers with Frankenstein engine
- ✅ Support for existing commerce controllers with Frankenstein engine
- ✅ New Frankenstein-specific wrapper controllers
- ✅ Type safety and runtime validation
- ✅ Unit and integration tests
- ✅ Documentation

**Out of Scope**:
- ❌ CDN support (deferred to later)
- ❌ Intent detection/auto-routing (no solution, punted)
- ❌ Server-side rendering variants (`/ssr-frankenstein`)
- ❌ Breaking changes to existing APIs
- ❌ Migration tooling
- ❌ Atomic component updates
- ❌ GenAI wrapper (RGA is search-only, display on all tabs is presentation logic)
- ❌ Analytics unification (APIs are fundamentally different: `buildInteractiveResult` vs `interactiveProduct`)

## Implementation Notes

- All steps maintain backward compatibility with existing search and commerce APIs
- Changes to existing controllers are additive only (adding support, not modifying behavior)
- Testing should verify both isolated engine usage and Frankenstein usage
- Documentation should emphasize when to use Frankenstein vs separate engines
- Each sub-engine maintains independent state - no state merging or combination
- Intent parameter defaults should be carefully chosen per controller (document rationale)

## Risks & Considerations

1. **State isolation**: Each sub-engine has its own store; ensure proper isolation and no cross-contamination
2. **Action independence**: Search and commerce actions are handled by separate Redux stores independently
3. **Type complexity**: Union types for engine parameters may complicate type inference
4. **Breaking changes**: Ensure changes to buildController don't break existing usage
5. **Performance**: Controllers subscribe to their respective sub-engine's store independently; monitor overall subscription overhead
6. **URL parameter collisions**: Critical requirement for URL manager wrapper with namespacing
7. **GenAI limitations**: Generated answers only work with search engine, not commerce
8. **Analytics API divergence**: Search uses `buildInteractiveResult`, Commerce uses `interactiveProduct` - cannot be unified
