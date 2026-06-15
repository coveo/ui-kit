# Headless Future Conversation Sample (React + Vite)

This sample bootstraps a React app with Vite and initializes a Headless Future Engine from environment variables.

It wires the Phase 1.9 conversation flow end-to-end:

- Press Enter to submit a user turn
- Stream and render assistant text responses
- Abort the active turn with the Stop button
- Show turn lifecycle and a raw debug event log

## Setup

1. Create your local env file:

cp .env.example .env.local

2. Fill in your Coveo values in .env.local.

3. Start the sample:

pnpm dev

## Required environment variables

- VITE_COVEO_ORGANIZATION_ID
- VITE_COVEO_ACCESS_TOKEN
- VITE_COVEO_TRACKING_ID
- VITE_COVEO_LANGUAGE
- VITE_COVEO_COUNTRY
- VITE_COVEO_CURRENCY

## Optional endpoint variables

- VITE_COVEO_PLATFORM_ENVIRONMENT (`dev` by default in this sample)
- VITE_COVEO_ENDPOINT (explicit override)
- VITE_COVEO_USE_VITE_PROXY (`true` by default in dev)

## Optional continuity query params

To seed continuity on the very first submit (before any stream event has been received),
you can pass values in the URL:

- `conversationSessionId` (alias: `sessionId` or `conversationId`)
- `conversationToken`

Example:

`http://localhost:5173/?conversationSessionId=session-123&conversationToken=token-123`

If `VITE_COVEO_ENDPOINT` is not set, the sample derives the endpoint from organization + environment, for example:

- `dev` -> `https://<organizationId>.admin.orgdev.coveo.com`
- `prod` -> `https://<organizationId>.admin.org.coveo.com`

## CORS note (localhost)

Direct browser calls to Coveo org endpoints can fail CORS preflight from `http://localhost`.

When `VITE_COVEO_USE_VITE_PROXY=true`, the sample sends requests to the local Vite origin and Vite proxies `/rest/*` to the Coveo endpoint, avoiding browser CORS blocking during local development.

## Scripts

- pnpm dev
- pnpm dev:mock — run against the local mock server (no credentials needed)
- pnpm build
- pnpm preview
- pnpm test
- pnpm e2e
- pnpm e2e:watch

## Running with the Mock Server

To run against the mock converse API (no live backend or credentials needed):

1. Start the mock server:

```bash
cd packages/mock-converse-api && pnpm start
```

2. Start the sample in mock mode:

```bash
cd samples/headless-future/conversation-react && pnpm dev:mock
```

This loads `.env.mock` which points `VITE_COVEO_ENDPOINT` to `http://localhost:3000`. The Vite proxy forwards `/rest/*` requests to the mock server.

Supported prompts in mock mode:

- "Build a beginner surfing kit with budget, mid-range, and premium options"
- "What should I pack for a snorkeling trip?"
- "kayaks"
- "wetsuits"
- Any other text (returns a fallback response)
