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

### A2UI Parser

Transforms opaque `A2UISurface` records from Thermidor turn state into typed `RenderableCommerceSurface` objects that Angular components can render directly.

### Surface Components

Standalone Angular components (all using `OnPush` change detection) render commerce surfaces via a `SurfaceOutlet` that maps each `componentType` to its corresponding renderer.

### Dev Server Proxy

The Angular CLI dev server proxies `/rest/**` requests to the Coveo platform, removing the need to configure CORS or expose endpoint URLs in client code.

## What This Sample Demonstrates

- **Thermidor Engine initialization** with environment-driven configuration and navigator context
- **ConverseController-driven conversation** using `submit`, `selectTurn`, `retry`, and state subscription
- **A2UI surface parsing** with Angular standalone components rendering typed commerce surfaces
- **Commerce surface components**: ProductCarousel, ComparisonTable, ComparisonSummary, BundleDisplay, NextActionsBar
- **Dev server proxy** routing requests to the Coveo platform without hardcoded URLs
- **Conversation persistence** via `serialize()` / `initialState` backed by `localStorage`
