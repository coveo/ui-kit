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
- pnpm build
- pnpm preview
- pnpm test
- pnpm e2e
- pnpm e2e:watch
