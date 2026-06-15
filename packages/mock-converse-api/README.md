# Mock Converse API

A lightweight Node.js HTTP server that replays pre-recorded SSE responses to simulate the Coveo `/converse` endpoint. Useful for local development and testing of AGUI/A2UI client integrations without a live backend.

## Quick Start

```bash
pnpm start

# Or with a custom port
PORT=4000 pnpm start
```

The server listens on port 3456 by default.

## Supported Prompts

The mock matches the `message` field from the request body (case-insensitive) and replays a pre-recorded response:

| Prompt                                                                     | Template      | Description                                        |
| -------------------------------------------------------------------------- | ------------- | -------------------------------------------------- |
| `Build a beginner surfing kit with budget, mid-range, and premium options` | response1.txt | Bundle display with budget/mid-range/premium tiers |
| `What should I pack for a snorkeling trip?`                                | response2.txt | Product carousels by category                      |
| `kayaks`                                                                   | response3.txt | Commerce search results for kayaks                 |
| `wetsuits`                                                                 | response4.txt | Commerce search results for wetsuits               |
| _(anything else)_                                                          | response5.txt | Fallback response                                  |

## Route Matching

The server matches any `POST` request whose URL path ends with `/converse`. This means it handles both:

- `POST /converse`
- `POST /rest/organizations/:orgId/commerce/unstable/agentic/converse`

Other routes return `404`. Non-POST methods on a matching route return `405`.

## Request Format

Send a JSON body with at minimum a `message` field:

```json
{
  "message": "kayaks"
}
```

All other fields (`trackingId`, `language`, `context`, `conversationSessionId`, etc.) are accepted but ignored. No authentication is required.

## Response Format

Responses are streamed as Server-Sent Events with `Content-Type: text/event-stream`. Events are sent one at a time with a small delay between them to simulate real streaming behavior.

## Adding New Prompts

To add a new prompt/response pair:

1. Record or create a new SSE response file in `templates/` (e.g., `response6.txt`). The file should follow the SSE wire format:

   ```
   event:turn_started
   data:{"conversationSessionId":"...","conversationToken":"..."}

   event:message
   data:{"type": "RUN_STARTED", "threadId": "...", "runId": "..."}

   ...

   event:turn_complete
   data:{"conversationSessionId":"...","conversationToken":"..."}
   ```

2. Add the template ID to `src/types.ts`:

   ```typescript
   export type TemplateId =
       | 'response1'
       | ...
       | 'response6';
   ```

3. Add the prompt mapping to `src/constants.ts`:

   ```typescript
   export const PROMPT_TEMPLATE_MAP: ReadonlyArray<{...}> = [
       ...
       {
           prompt: 'your new prompt in lowercase',
           templateId: 'response6',
       },
   ];
   ```

4. Restart the server.

## Updating Existing Responses

Replace the content of any file in `templates/` with a new recorded SSE stream. No code changes needed — just restart the server.

## Running Tests

```bash
pnpm test
```
