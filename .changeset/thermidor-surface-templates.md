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

`session.instantiateSurface(template, {surfaceId})` creates an instance of one of the contract's surface templates before any request, under the template's own catalog, and exposes its renderer messages. Its surface id starts with the contract's `surfaceInstanceIdPrefix` (`template:`): a minted one is `template:search-box-1`, and a given one without the prefix throws. Its lookup actions go through `dispatchAction` and apply their results to that instance only. Their payloads and results are validated against the template's `componentContracts`.

Lookups are exempt from sending one request at a time: a lookup is sent at once, even before the first prompt or while an answer streams, is never withheld, never withholds another dispatch, and never sets `session.request`, so `sendAndWait` does not wait for it. Its `dispatchAction` promise resolves once its run ends: answered, failed, superseded by a newer lookup, or aborted when its instance is disposed of.
