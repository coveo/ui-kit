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
- The `HeadlessEngine` class has been replaced by builder functions dedicated to each use-case.
```
// For a search interface
import {buildSearchEngine} from '@coveo/headless';

// For a recommendation interface
import {buildRecommendationEngine} from '@coveo/headless/recommendation';

// For a product recommendation interface
import {buildProductRecommendationEngine} from '@coveo/headless/product-recommendation'
```

- The `renewAccessToken` concept is now only exposed as an engine configuration option. When the function is specified, a headless engine will call it to obtain a new token if it detects a `419` HTTP status code.