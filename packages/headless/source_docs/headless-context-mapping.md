---
title: Set context mapping values
group: Guides
---

# Set context mapping values

If you have [configured context mappings](https://docs.coveo.com/en/q3bc0472/) on a tracking ID, you can use the [`setCustom`](../../interfaces/Commerce.Context.html#setcustom) method on the [`Context`](../../interfaces/Commerce.Context.html) controller to specify custom context values at query time.

[Context mappings](https://docs.coveo.com/en/q3bc0472/coveo-for-commerce/use-context-mappings) let you extend the default `context` object in Commerce API requests with custom fields.
Each mapping defines a key, a data type, and one or more destinations that control where the Commerce API routes the value — such as the [query pipeline](https://docs.coveo.com/en/180/) context, [Coveo ML](https://docs.coveo.com/en/188/) context, or [field aliases](https://docs.coveo.com/en/q1q94008/).

> [!TIP] **Type definitions**
>
> - [`Context`](../../interfaces/Commerce.Context.html)
> - [`ContextState`](../../interfaces/Commerce.ContextState.html)
> - [`buildContext`](../../functions/Commerce.buildContext.html)

## Prerequisites

Before using `setCustom`, you must [create context mappings](https://docs.coveo.com/en/q3bc0472/coveo-for-commerce/use-context-mappings#create-a-context-mapping) on your tracking ID using the Context Mappings API.
The Commerce API validates each value you send against its configured type and silently drops any key that does not match.

## Example context mappings

The following examples assume the target tracking ID has been configured with these context mappings, matching the [List context mappings](https://docs.coveo.com/en/q3bc0472/coveo-for-commerce/use-context-mappings#list-context-mappings) example in the documentation:

```json
[
  {
    "key": "fitmentProducts",
    "type": "PRODUCT_LIST",
    "destinations": [
      { "attribute": "QUERY_PIPELINE_CONTEXT" }
    ]
  },
  {
    "key": "shoppingIntent",
    "type": "STRING",
    "destinations": [
      { "attribute": "ML_CONTEXT" },
      { "attribute": "QUERY_PIPELINE_CONTEXT" }
    ]
  },
  {
    "key": "storeId",
    "type": "STRING",
    "destinations": [
      {
        "attribute": "FIELD_ALIASES",
        "fieldAlias": "price_dict",
        "fieldSource": "price_dict.{{contextValue}}"
      }
    ]
  }
]
```

| Key | Type | Destinations | Typical use case |
| --- | --- | --- | --- |
| `fitmentProducts` | `PRODUCT_LIST` | `QUERY_PIPELINE_CONTEXT` | Filter results to compatible parts via a pipeline filter rule. |
| `shoppingIntent` | `STRING` | `ML_CONTEXT`, `QUERY_PIPELINE_CONTEXT` | Influence ML relevance and enable intent-based ranking expressions. |
| `storeId` | `STRING` | `FIELD_ALIASES` | Resolve store-specific pricing from a dictionary field. |

## Determining suitable values

The values you pass to `setCustom` depend on the context mapping type and your application's runtime state.

- **`STRING`** values like `shoppingIntent` are typically derived from the section of the site the user is browsing (e.g., a category page) or from an explicit user selection.
- **`STRING`** values like `storeId` often come from a user preference stored in a cookie or session, such as a selected store location.
- **`PRODUCT_LIST`** values like `fitmentProducts` are usually derived from user interactions (e.g., a vehicle selector that resolves to compatible part SKUs) or from [product recommendations](https://docs.coveo.com/en/3382/).
- **`BOOLEAN`** values (e.g., `contractCustomer`) are typically resolved from authentication state or user profile data.
- **`NUMBER`** values (e.g., `loyaltyTier`) may come from a CRM or loyalty system.

## Setting custom context at query time

Call [`setCustom`](../../interfaces/Commerce.Context.html#setcustom) on the [`Context`](../../interfaces/Commerce.Context.html) controller before dispatching a search action.
The controller automatically includes the custom context in all subsequent Commerce API requests.

### JavaScript example

The following is a complete vanilla JavaScript example that demonstrates `setCustom` with the three context mappings above.

> [!TIP] **Type definitions**
>
> - [`CommerceEngineOptions`](../../interfaces/Commerce.CommerceEngineOptions.html)
> - [`Context`](../../interfaces/Commerce.Context.html)
> - [`SearchActionCreators`](../../interfaces/Commerce.SearchActionCreators.html)
> - [`buildCommerceEngine`](../../functions/Commerce.buildCommerceEngine.html)
> - [`buildContext`](../../functions/Commerce.buildContext.html)
> - [`buildSearch`](../../functions/Commerce.buildSearch.html)
> - [`loadSearchActions`](../../functions/Commerce.loadSearchActions.html)

> [!NOTE]
> `setCustom` replaces the entire `custom` object each time it is called.
> If you need to update a single key while preserving others, spread the existing `contextController.state.custom` values into your new object.

{ @includeCode ../../../samples/headless/commerce-custom-context-native/index.js }


## Setting custom context at engine initialization

You can also provide initial custom context values when building the commerce engine, through the `context.custom` property of the engine configuration.

{ @includeCode ../../../samples/headless/commerce-custom-context-native/engineWithPopulatedContext.js }

Values set at initialization are included in all Commerce API requests from the start.
Use `setCustom` to update them dynamically as the user navigates or interacts with your application.

## Further reading

- [Use context mappings](https://docs.coveo.com/en/q3bc0472) — Configuration guide for context mappings
- [Headless commerce usage (client-side rendering)](https://docs.coveo.com/en/o6r70022) — Complete guide to building a commerce search interface with Headless
