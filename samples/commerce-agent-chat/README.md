# Commerce Agent Chat Sample

Private local sample to chat with the commerce agent over AG-UI streaming.

## Setup

1. Install dependencies from repo root:
   `pnpm install`
2. Create local env file:
   `cp samples/commerce-agent-chat/.env.example samples/commerce-agent-chat/.env.local`
3. Fill required values in `.env.local`.
4. Ensure the commerce agent is running on `http://localhost:8080`.
5. Keep `VITE_AGENT_URL=/api` for local dev to route requests through Vite and avoid CORS.

## Commands

Run from `samples/commerce-agent-chat`:

- `pnpm dev`
- `pnpm test`
- `pnpm lint:check`
- `pnpm lint:fix`
- `pnpm build`

Run from repository root:

- `pnpm turbo test --filter=@coveo/commerce-agent-chat`
- `pnpm turbo build --filter=@coveo/commerce-agent-chat`

## Notes

- This sample is intentionally private and local-only.
- The invocation payload includes `forwardedProps.coveo` and omits `forwardedProps.policy`.
- In dev mode, Vite proxies `/api/*` to `http://localhost:8080/*`.
