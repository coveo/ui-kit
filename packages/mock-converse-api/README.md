# Mock Converse API

Thin HTTP server wrapper around `@coveo/platform-mock-api` Converse handlers, exposed via [`@mswjs/http-middleware`](https://github.com/mswjs/http-middleware).

## Quick start

```bash
pnpm --filter @coveo/mock-converse-api build
pnpm --filter @coveo/mock-converse-api start
```

By default, the server listens on port `3456`.

```bash
PORT=4000 pnpm --filter @coveo/mock-converse-api start
```

## Routes

- `POST /converse`
- `POST /rest/organizations/:orgId/commerce/unstable/agentic/converse`
- `POST /api/preview/organizations/:orgId/agents/commerce/agui/converse`

These serve the older templates. The schema-driven templates (`schema-response-*.ts`) are served on:

- `POST /converse-schema`
- `POST /schema/rest/organizations/:orgId/commerce/unstable/agentic/converse`
- `POST /schema/api/preview/organizations/:orgId/agents/commerce/agui/converse`
- `POST /schema/api/organizations/:orgId/agents/commerce/agui/converse`: the public route, the
  preview path without `preview/`. As Thermidor ADR-028 decides, its answers to prompts send no
  `TOOL_CALL_*` events and send the agent's progress as a `ProgressBlock` surface instead. The
  other schema routes send the templates as they are.

Supported prompts and response templates are inherited directly from
`@coveo/platform-mock-api/converse`.

## CORS and method handling

- `OPTIONS` on Converse routes returns `204` with permissive CORS headers.
- Non-`POST` methods on Converse routes return `405`.
- Other routes return `404`.

## Running tests

```bash
pnpm --filter @coveo/mock-converse-api test
```
