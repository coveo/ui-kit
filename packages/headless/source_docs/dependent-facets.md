---
title: Use dependent facets
group: Usage
slug: usage/use-dependent-facets
---
# Use dependent facets

In the context of a search application, a frequent use case is to define relationships between facets (or filters), so that a dependent facet will only appear when the user interacts with its specified parent facet.

Let’s assume that you have a `@moviegenre` facet field in your Coveo index, as well as a `@moviesubgenre` facet field.

`@moviegenre` may contain values such as `Action`, `Comedy`, or `Drama`.

`@moviesubgenre` may contain values such as `War and Military Action`, `Martial Arts Action`, `Parody Comedy`, or `Historical Drama`.

In your search interface, you only want the user to see the **Movie genre** facet initially.
The **Movie subgenre** facet only appears after a selection is made in the **Movie genre** facet.

## Defining the Relationship

The facet conditions manager lets you define dependencies to use when enabling a facet.

```typescript
import { buildFacetConditionsManager } from "@coveo/headless";
import type {
  SearchEngine,
  Facet,
  AnyFacetValuesCondition,
  FacetValueRequest,
} from "@coveo/headless";

function makeDependent(
  engine: SearchEngine,
  dependentFacet: Facet,
  parentFacets: Facet[]
) {
  const facetConditionsManager = buildFacetConditionsManager(engine, {
    facetId: dependentFacet.state.facetId,
    conditions: [
      parentFacets.map((parentFacet) => {
        const parentFacetHasAnySelectedValueCondition: AnyFacetValuesCondition<FacetValueRequest> =
          {
            parentFacetId: parentFacet.state.facetId,
            condition: (parentValues) =>
              parentValues.some((v) => v.state === "selected"),
          };
        return parentFacetHasAnySelectedValueCondition;
      }),
    ],
  });

  dependentFacet.subscribe(() => {
    setFacetVisibility(
      dependentFacet.state.facetId,
      dependentFacet.state.enabled
    );
  });

  addOnFacetDestroyedListener(dependentFacet.state.facetId, () => {
    facetConditionsManager.stopWatching();
  });
}

/**
 * Show or hide the facet from the user.
 */
function setFacetVisibility(facetId: string, shouldBeVisible: boolean) {
  // your code
}

/**
 * Clean up a facet that we are no longer using. E.g.: when changing pages.
 */
function addOnFacetDestroyedListener(facetId: string) {
  // your code
}
```

In the example above, the `makeDependent` function can be called to define a relationship between a dependent facet and one or more parent facets.

You can modify the `condition` function to fit your particular use case.
For example, instead of verifying whether any value is selected (that is, equals `selected`) in the parent facet, you could verify the state of a specific value.

We don’t provide sample implementations for the `setFacetVisibility` and `addOnFacetDestroyedListener` functions, as they will vary depending on which Web framework you’re using (for example, Angular, React, or Vue).

## React Example

To better understand this explanation, you can refer to this example made with React:
[Dependent Facet React Example](https://github.com/coveo/ui-kit/blob/master/samples/headless/search-react/src/pages/DependentFacetPage.tsx).