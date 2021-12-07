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
Components should be given a short but specific description explaining its role. Include relevant information about certain behaviours or limitations of the component here when pertinent to developers.

### @fires
Events fired from this component should be defined using the `@fires` tag.

### @category
Each component should be given one or more category values using the `@category` tag from one of the following cateogories:
- **Search**: Components pertaining to the Search use-case.
- **Case Assist**: Components pertaining to the Case Assist use-case.
- **Result Template**: Components meant to be used within result templates.
- **Utility**: Components providing a generic utility without pertaining to any specific Coveo Headless use-case.
If there is more than one relevant category it should be specified with its own tag.
If a new category is required it should be discussed with the code owners and adjustements must be made to the parsing script.

### @example
An example must be provided using the `@example` tag which includes inline values for all public properties. It is recommended to use values that are different from the default values of each property.

example:
```js
/**
 * The `QuanticFacetValue` component is used by a facet component to display a formatted facet value and the number of results with that value.
 * @fires CustomEvent#selectvalue
 * @category Search
 * @category Utility
 * @example
 * <c-quantic-facet-value onselectvalue={onSelect} item={result} is-checked={result.checked} display-as-link={displayAsLink} formatting-function={formattingFunction}></c-quantic-facet-value>
 */
export default class QuanticBreadcrumbManager extends LightningElement {
  ...
}
```

## Public Properties
Public properties, marked using an `@api` **decorator** should be given a JSDoc comment following these guidelines.
Each public property should be given a short but specific description explaining its role. Include relevant information about certain behaviours or limitations of the component here when pertinent to developers.

### @api
Each public property should be given an `@api` tag in the JSDoc comment.

### @type
A type value must be specified for each public property. If the type is non-primitive as is the case if it is defined in Coveo Headless, a link to public documentation containing more detailed information should be provided.

### @defaultValue
The default value should be defined in between back quote (\`) characters using the `@defaultValue` tag.

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
Run `npm run doc:generate` to generate the parsed JSON.
The script runs automatically as part of `npm run test` to catch potential errors in pull request checks.