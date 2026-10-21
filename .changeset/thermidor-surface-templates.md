---
'@coveo/thermidor': minor
---

Instantiate surface templates, such as the search box, and send their lookups without waiting for prompts or other actions.

**Breaking:** `createSession` takes the whole contract as `contract`, which replaces `contracts`. Pass the schema's bundle instead of its component union, and type the session by that bundle:

```diff
-import {ComponentContractsSchema} from '@coveo/thermidor-schema';
+import {ThermidorContract} from '@coveo/thermidor-schema';

-const session: Session<typeof ComponentContractsSchema> = createSession({contracts: ComponentContractsSchema, ...});
+const session: Session<typeof ThermidorContract> = createSession({contract: ThermidorContract, ...});
```

`session.contracts` is now `session.contract`.

`session.instantiateSurface(template, {surfaceId})` creates an instance of one of the contract's surface templates before any request, and exposes its renderer messages. Its lookup actions go through `dispatchAction`, are sent at once, even before the first prompt or while an answer streams, and apply their results to that instance only.
