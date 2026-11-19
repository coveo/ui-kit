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

As Thermidor ADR-028 decides, every turn the agent runs on these routes sends its progress as a
`ProgressBlock` surface, beside the tool calls its template already sends. Searches are answered by
the gateway, without the agent, so they send no block.

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
