# Commerce Agent Chat Sample

Private local sample to chat with the commerce agent over AG-UI streaming.

## Setup

1. Install dependencies from repo root:
   `pnpm install`
2. Create local env file:
   `cp samples/commerce-agent-chat/.env.example samples/commerce-agent-chat/.env.local`
3. Fill required values in `.env.local`.

## Agent modes

Set `VITE_AGENT_MODE` in `.env.local` to one of:

| Mode        | Description                                             | `VITE_AGENT_URL` |
| ----------- | ------------------------------------------------------- | ---------------- |
| `local`     | Proxies to a local agent at `http://localhost:8080`     | `/api`           |
| `coveo-dev` | Proxies to the Coveo dev platform (`VITE_PLATFORM_URL`) | `/api/coveo-dev` |

Keep `VITE_AGENT_URL` set to the proxy prefix shown above — this routes requests through Vite and avoids CORS issues.

For `local` mode, ensure the commerce agent is running on `http://localhost:8080` before starting the dev server.

## Commands

Run from `samples/commerce-agent-chat`:

- `pnpm dev` — starts the dev server on port 3001
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
