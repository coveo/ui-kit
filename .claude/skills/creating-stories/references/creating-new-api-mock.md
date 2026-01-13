# Creating a New API Mock

Only create a new mock if the API domain you need does not already exist under `packages/atomic/storybook-utils/api/`.

If you do need to add a new domain, follow the patterns in `packages/atomic/storybook-utils/api/README.md`.

## 1) Create a new domain directory

Create `packages/atomic/storybook-utils/api/<api-domain>/`.

## 2) Create a base response file

Create `packages/atomic/storybook-utils/api/<api-domain>/<endpoint>-response.ts`:

```ts
export const baseResponse = {
  // Structure matching the real API response
};
```

## 3) Create the mock harness class

Create `packages/atomic/storybook-utils/api/<api-domain>/mock.ts`:

```ts
import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {baseResponse} from './<endpoint>-response.js';

export class Mock<Domain>Api implements MockApi {
  readonly <endpoint>Endpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.<endpoint>Endpoint = new EndpointHarness<
      typeof baseResponse | APIErrorWithStatusCode
    >('POST', `${basePath}/rest/path/to/endpoint`, baseResponse);
  }

  get handlers(): HttpHandler[] {
    return [this.<endpoint>Endpoint.generateHandler()];
  }
}
```

## Multiple endpoints

If the domain has multiple endpoints, expose multiple `EndpointHarness` properties and return all handlers:

```ts
get handlers(): HttpHandler[] {
  return [
    this.searchEndpoint.generateHandler(),
    this.suggestEndpoint.generateHandler(),
  ];
}
```

## Naming conventions

- Mock class file: `mock.ts`
- Response file: `<endpoint>-response.ts` (or `<endpoint>-response.ts` variants already used in the repo)
- Mock class: `Mock<Domain>Api`
- Endpoint properties: `<endpoint>NameEndpoint` (camelCase)
- Base response export: `baseResponse`

## Special cases

- Streaming/SSE endpoints: follow `packages/atomic/storybook-utils/api/answer/`.
- Paths with multiple dynamic segments: use MSW path parameters like `:orgId`.
