If you are migrating across a major version, be aware of the following breaking changes:

## Migrating from v0 to v1

- Action namespaces have been replaced by loader functions.
```
// v0
import {SearchActions} from '@coveo/headless';

SearchActions.executeSearch(...)

// v1
import {loadSearchActions} from '@coveo/headless';

const actions =  loadSearchActions(engine);
actions.executeSearch(...)
```