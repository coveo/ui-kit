# Frankenstein Engine: Unified Search & Commerce Engine Spec & Implementation Plan

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
- Combined Redux store with both search and commerce reducers
- State accessed via `engine[stateKey]`
- Contains union of search and commerce state slices

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

**Mechanism**: Controller methods accept optional intent parameter for dual-mode operations.

**Example**:
```typescript
// Search intent (default)
searchBox.submit();

// Commerce intent
searchBox.submit({intent: 'commerce'});

// Facet selection with intent
facet.toggleSelect(value, {intent: 'commerce'});
```

**Implementation**:
- Frankenstein controllers expose methods with optional `intent` parameter
- Intent values: `'search' | 'commerce'`
- Default behavior when no intent specified (TBD per controller)
- Routes action to appropriate sub-engine based on intent

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
      // Merge or select based on context
    },
  };
}
```

**Location**: `packages/headless/src/controllers/frankenstein/`

### 6. Entry Point Structure

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
- Frankenstein controllers from `controllers/frankenstein/`
- Types and utilities

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
   - Modify `buildRecommendationEngine` to pass `'search'` marker (it's search-based)
   - Modify `buildInsightEngine` to pass `'search'` marker

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
     * Build search engine with search config
     * Build commerce engine with commerce config
     * Create combined Redux store
     * Store sub-engines via Symbols
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
   - Configuration validation works
   - Combined state includes both search and commerce slices

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
    - Merge state from both sub-controllers
    - Location: `src/controllers/frankenstein/search-box/headless-frankenstein-search-box.ts`

15. **Implement other Frankenstein controllers** (*parallel, depends on step 13*)
    - Identify which controllers need Frankenstein variants:
      * Facet Generator (can generate both search and commerce facets)
      * Breadcrumb Manager (unified breadcrumb for both)
      * Sort Controller (unified sort)
      * Pagination Controller (unified pagination)
      * Query Summary (unified summary)
    - Implement each following the wrapper pattern

16. **Verification**
    - Frankenstein controllers only accept FrankensteinEngine
    - Intent routing works correctly
    - State merging logic is sound
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
- `src/controllers/frankenstein/search-box/headless-frankenstein-search-box.ts` - Unified searchbox
- `src/controllers/frankenstein/facet-generator/headless-frankenstein-facet-generator.ts` - Unified facet generator
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
5. **Intent branching**: Optional parameter on controller methods (e.g., `submit({intent: 'commerce'})`) for explicit routing
6. **Frankenstein controllers**: Wrapper pattern that composes existing search and commerce controllers
7. **Controller supportEngine**: Internal parameter in `buildController` function, with runtime validation and sub-engine routing

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

## Implementation Notes

- All steps maintain backward compatibility with existing search and commerce APIs
- Changes to existing controllers are additive only (adding support, not modifying behavior)
- Testing should verify both isolated engine usage and Frankenstein usage
- Documentation should emphasize when to use Frankenstein vs separate engines
- Consider performance implications of dual-engine state management
- Intent parameter defaults should be carefully chosen per controller (document rationale)

## Risks & Considerations

1. **State size**: Combined store may be large; consider lazy-loading reducers
2. **Action collision**: Ensure search and commerce actions don't conflict in combined store
3. **Type complexity**: Union types for engine parameters may complicate type inference
4. **Breaking changes**: Ensure changes to buildController don't break existing usage
5. **Performance**: Dual state subscription may impact performance; monitor and optimize
6. **Intent ambiguity**: Default intent choices may surprise users; document clearly
