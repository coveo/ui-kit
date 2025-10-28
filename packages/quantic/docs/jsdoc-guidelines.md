# JSDoc Guidelines for Quantic Components

The Quantic library has [reference documentation](https://docs.coveo.com/en/quantic/latest/reference/) that is automatically generated from JSDoc comments in the component source code. The component comments are parsed by JSDoc and the resulting doclet data is parsed by our custom template script found in `quantic/docs/template/lwc-json/publish.js`. This document outlines the required attributes and format of these JSDOC comments.

## Type Imports

It is common to reference types from external dependencies, most notably Coveo Headless.
Types should be defined via `typedef` before the class definition.

example:

```js
/** @typedef {import("coveo").SearchEngine} SearchEngine */
```

## Components

Components should be given a short but specific description explaining their role. Include relevant information about certain behaviors or limitations of the component when pertinent to developers.

### @fires

Events fired from this component should be defined using the `@fires` tag.

### @category

Each component should be given one or more category values using the `@category` tag from one of the following categories:

- **Search**: Components pertaining to the Search use case.
- **Case Assist**: Components pertaining to the Case Assist use case.
- **Insight Panel**: Components pertaining to the Insight Panel use case
- **Recommendation**: Components pertaining to the Recommendation use case
- **Result Template**: Components meant to be used within result templates.
- **Utility**: Components providing a generic utility without pertaining to any specific Coveo Headless use-case.
- **Internal** Components that are not to be publicly documented.
  If there are more than one relevant category, each should be specified with its own tag.
  If a new category is required it should be discussed with the code owners and adjustments must be made to the parsing script.

### @example

An example must be provided using the `@example` tag which includes inline values for all public properties. It is recommended to use values that are different from the default values of each property.

example:

```js
/**
 * The `QuanticFacetValue` component is used by a facet component to display a formatted facet value and the number of results with that value.
 * @fires CustomEvent#selectvalue
 * @category Search
 * @example
 * <c-quantic-facet-value onselectvalue={onSelect} item={result} is-checked={result.checked} display-as-link={displayAsLink} formatting-function={formattingFunction}></c-quantic-facet-value>
 */
export default class QuanticFacetValue extends LightningElement {
  ...
}
```

## Public Properties

Public properties, marked using an `@api` **decorator**, should be specified via JSDoc comments following the guidelines below.
Each public property should be given a short but specific description explaining its role. Include relevant information about certain behaviors or limitations of the component here when pertinent to developers.

### @api

Each public property documentation string should be preceded by an `@api` tag in the JSDoc comment.

### @type

A type value must be specified for each public property. If the type is non-primitive as is the case when defined in Coveo Headless, a link to public documentation containing more detailed information should be provided.

### @defaultValue

The default value should be defined in between back quote (\`) characters using the `@defaultValue` tag.
If no `@defaultValue` tag is found the property is marked as required.

example:

```js
/**
 * A character that divides each path segment in a category facet breadcrumb.
 * @api
 * @type {string}
 * @defaultValue `'/'`
 */
@api categoryDivider = '/';
```

## Generating The Reference Documentation JSON

Run `pnpm run build:doc` to generate the parsed JSON.
The script runs automatically as part of `pnpm run build` to catch potential errors in pull request checks.
