# Thermidor Angular Commerce Agent Sample

A Thermidor-integrated Angular commerce agent experience within the ui-kit monorepo. This sample demonstrates how to build a conversational commerce storefront using the `@coveo/thermidor` headless library with Angular standalone components.

## Getting Started

Install dependencies from the monorepo root:

```bash
pnpm install
```

Run the sample from the sample directory:

```bash
pnpm run dev
```

Then open `http://localhost:4200/`.

### Running with the mock service

To run against the local mock converse API (no Coveo credentials required):

```bash
# Terminal 1 — start the mock server
cd packages/mock-converse-api
pnpm build && node dist/server.js

# Terminal 2 — start the Angular sample with mock routing
cd samples/thermidor/generative-angular
pnpm dev:mock
```

Then open `http://localhost:4200/` and try one of the supported prompts:

- `surfboards v09` — ProductCarousel + NextActionsBar
- `compare wetsuits v09` — ComparisonTable + ComparisonSummary + NextActionsBar
- `surfing bundle v09` — BundleDisplay + NextActionsBar

## Environment Configuration

The sample reads configuration from Angular environment files located at:

- `src/environments/environment.ts` — production defaults
- `src/environments/environment.development.ts` — development overrides (used by `pnpm run dev`)

### Required Values

| Field            | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `organizationId` | Your Coveo organization ID                               |
| `accessToken`    | API access token for the organization                    |
| `trackingId`     | Analytics tracking identifier                            |
| `language`       | Language code (e.g., `en`)                               |
| `country`        | Country code (e.g., `AU`)                                |
| `currency`       | Currency code (e.g., `AUD`)                              |
| `endpoint`       | Platform endpoint URL (leave empty to use the dev proxy) |

## Architecture

The sample follows the Thermidor headless pattern:

```
Engine → GenerativeInterface → ConverseController → Angular UI
```

### ThermidorService (Injectable)

A root-provided Angular service that initializes the Thermidor stack:

1. Creates an `Engine` with configuration from environment files and a `NavigatorContextProvider` supplying `clientId`, `location`, `referrer`, and `userAgent`.
2. Builds a `GenerativeInterface` via `buildGenerativeInterface({engine})`.
3. Builds a `ConverseController` via `buildConverseController({interface, initialState})`, restoring any previously persisted conversation from `localStorage`.

### ConverseController

The controller exposes the public conversation API consumed by Angular components:

- `submit({prompt})` — send a user message
- `selectTurn({id})` — navigate between turns
- `retry({id})` — retry a failed turn
- `serialize()` — snapshot conversation state for persistence

### A2UI Renderer Integration

This sample uses the official `@a2ui/angular` v0.9 renderer to render surfaces. The integration consists of:

- **`A2uiAdapterService`** — extracts v0.9 operations from Thermidor's opaque surface records and forwards them to the `A2uiRendererService`, managing surface lifecycle (deleting stale surfaces when new ones arrive).
- **`A2UI_RENDERER_CONFIG`** — provides the renderer with a custom catalog of commerce components and an action handler that triggers new prompts through the `ConversationService`.
- **Custom Catalog** (`custom-catalog.ts`) — registers commerce components (ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar) with the A2UI renderer.
- **`SurfaceComponent`** (`<a2ui-v09-surface>`) — the standard A2UI component host that dynamically instantiates the correct component for each surface.

### Commerce Components

Standalone Angular components (all using `OnPush` change detection) implement the A2UI `CatalogComponentInstance` interface. They receive a `props` signal input from the renderer and derive display values using the `prop()` utility from `a2ui/prop-reader.ts`.

### Dev Server Proxy

The Angular CLI dev server proxies `/rest/**` requests to the Coveo platform, removing the need to configure CORS or expose endpoint URLs in client code.

## What This Sample Demonstrates

- **Thermidor Engine initialization** with environment-driven configuration and navigator context
- **ConverseController-driven conversation** using `submit`, `selectTurn`, `retry`, and state subscription
- **Standard A2UI v0.9 renderer** (`@a2ui/angular`) with custom catalog registration and reactive surface rendering
- **Custom commerce components**: ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar — all implementing `CatalogComponentInstance`
- **Dev server proxy** routing requests to the Coveo platform without hardcoded URLs
- **Conversation persistence** via `serialize()` / `initialState` backed by `localStorage`
