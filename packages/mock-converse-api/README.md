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
