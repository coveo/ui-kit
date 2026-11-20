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

## Making an action fail

A facet search (the `search` action of a `RegularFacet` or `CategoryFacet`) for one of these
words fails, so a client can show a failed action. Search a facet of the `water sports` answer:

| Search for | What the mock answers                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `fail`     | HTTP `200` with a stream of one `RUN_ERROR` (`AGENT:INTERNAL_ERROR`), as Agent Gateway ends an action whose Commerce API call failed |
| `reject`   | HTTP `400` `AGENT:ACTION_NOT_APPLICABLE`, as Agent Gateway rejects an action before its stream starts                                |

The words match whole and ignore case and surrounding spaces. Neither failure changes the search
surface, and the next action is answered as usual.

## CORS and method handling

- `OPTIONS` on Converse routes returns `204` with permissive CORS headers.
- Non-`POST` methods on Converse routes return `405`.
- Other routes return `404`.

## Running tests

```bash
pnpm --filter @coveo/mock-converse-api test
```
