---
title: Use result templates
group: Usage
slug: usage/use-result-templates
---
# Result templates
In Headless, a `ResultTemplate` is an object that specifies the content of a template as well as a list of conditions to fulfill for that template to be selected for any given result.

**Example**

```typescript
import { ResultTemplate, Result } from "@coveo/headless";
import React from "React"

const myResultTemplate: ResultTemplate = { ①
  content: (result: Result) => (<div>{result.title}</div>), ②
  conditions: [(result: Result) => { ③
    return !!result.title;
  }]
}
```
1. Defines a `ResultTemplate` element which will be rendered to the user interface.
Specifying the content and conditions properties is mandatory, whereas priority and fields are optional.
For more details on these properties, see the [reference documentation](https://docs.coveo.com/en/headless/latest/usage/result-templates#resulttemplate).
2. Creates a function that takes as input the given `result` and returns the `title`, enclosed in a `div` tag.
3. Specifies that the result must contain a `title` for this template to be used.

As the complexity of your implementation increases, you may have to define multiple templates with different conditions registered by several components.
At this point, it may become difficult to manage the state of these templates.
Headless lets you create and manage templates with its `ResultTemplatesManager` controller to solve this issue.

To use the `ResultTemplatesManager`, you must instantiate it and register result templates before executing a query.
When you render results, you can then call on the manager to select the most appropriate template for that result.

The following example code shows a basic use case of the `ResultTemplatesManager`.

```javascript
import { buildResultTemplatesManager,
         ResultTemplatesManager,
         Result,
         ResultTemplatesHelpers } from "@coveo/headless";
import { headlessEngine } from "../Engine";
// ...
 
export default class ResultList {
  // ...
  private headlessResultTemplatesManager: ResultTemplatesManager;
  // ...
  constructor(props: any) {
    // ...
    this.headlessResultTemplatesManager =
      buildResultTemplatesManager(headlessEngine); ①
    this.headlessResultTemplatesManager.registerTemplates( ②
      {
        conditions: [], ③
        content: (result: Result) => (
          <li>
            <h4>{result.title}</h4>
            <p>{result.excerpt}</p>
          </li>
        )
      },
      {
        conditions: [
          ResultTemplatesHelpers.fieldMustMatch("source", ["Techzample"])], ④
        content: (result: Result) => (
          <li>
            <h4>Techzample: {result.title}</h4>
            <p>{result.excerpt}</p>
          </li>
        ),
        priority: 1 ⑤
      }
    );
    // ...
  }
  // ...
  render() {
    return (
      <ul>
        {this.state.results.map((result: Result) => {
          const template =
            this.headlessResultTemplatesManager.selectTemplate(result); ⑥
          return template(result);
        })}
      </ul>
    );
  }
}
```
1. Instantiates a new `ResultTemplatesManager`.
2. Registers templates on your `ResultTemplatesManager`.
You can pass multiple templates as separate parameters, or call `registerTemplates` multiple times.
3. Results will always satisfy this template’s conditions because there are none, making this the default template.
4. Headless offers result template helpers to make it easier to define conditions.
See the [reference documentation](https://docs.coveo.com/en/headless/latest/usage/result-templates#resulttemplateshelper) for more information.
5. Sets the priority of the result template.
If multiple templates' conditions are satisfied by a given result, the template with the highest priority will be selected.
If multiple templates have equal priority, the first template registered will win out.
6. Selects the most appropriate result template for the given result.

## Reference

Take a look at the [Headless project repository](https://github.com/coveo/ui-kit/tree/master/packages/headless/src/features/result-templates) for more information about the data types and methods detailed here.

### ResultTemplate

Element which will be rendered in the list of suggestions.

| Property | Description | Type |
| --- | --- | --- |
| `content` (required) |  The template itself. It can be anything, but generally it will be a function that takes a result and returns something to display. | `Content` |
| `conditions` (required) | The conditions that a result must satisfy for this template to be selected for that result. If an empty array of conditions is passed in, the template will be considered as a default that may be chosen for any result. Various [`ResultTemplatesHelpers`](https://docs.coveo.com/en/headless/latest/usage/result-templates#resulttemplateshelper) can easily be used to create conditions. | `ResultTemplateCondition[]` |
| `priority` | Defaults to 0. When `selectTemplate(result)` is called, the result may satisfy the conditions of several registered templates. When this happens, the template with the highest priority is selected. If several templates are satisfied and have the same priority, then the first one that was registered is chosen. | `number` |
| `fields` | The names of the Coveo fields used in the template’s content. This property tells the index to include those fields in the returned results. | `string[]` |

### ResultTemplatesHelper

Contains several helper methods to interact with a `ResultTemplate` object and define `conditions`.

#### `getResultProperty`

Extracts a property from a result object.

**Parameters**

* **result**: `Result` (required)

  The target result.
* **property**: `string` (required)

  The property to extract.

**Returns** `unknown`
+
The value of the specified property in the specified result, or null if the property does not exist.

#### `fieldsMustBeDefined`

Creates a condition that verifies if the specified fields are defined.

**Parameters**

* **fieldNames**: `string[]` (required)

  A list of fields that must be defined.

**Returns** `ResultTemplateCondition`
+
A function that takes a result and checks if every field in the specified list is defined.

#### `fieldsMustNotBeDefined`

Creates a condition that verifies if the specified fields are not defined.

**Parameters**

* **fieldNames**: `string[]` (required)

  A list of fields that must not be defined.

**Returns** `ResultTemplateCondition`
+
A function that takes a result and checks if every field in the specified list is not defined.

#### `fieldMustMatch`

Creates a condition that verifies if a field’s value contains any of the specified values.

**Parameters**

* **fieldName**: `string` (required)

  The name of the field to check.
* **valuesToMatch**: `string[]` (required)

  A list of possible values to match.

**Returns** `ResultTemplateCondition`
+
A function that takes a result and checks if the value for the specified field matches any value in the specified list.

#### `fieldMustNotMatch`

Creates a condition that verifies that a field’s value does not contain any of the specified values.

**Parameters**

* **fieldName**: `string` (required)

  The name of the field to check.
* **blacklistedValues**: `string[]` (required)

  A list of all disallowed values.

**Returns** `ResultTemplateCondition`
+
A function that takes a result and checks that the value for the specified field does not match any value in the given list.

### ResultTemplatesManager

Registers any number of result templates in the manager.

#### Initialize

##### `buildResultTemplatesManager`

Build a manager where result templates can be registered and selected based on a list of conditions and priorities.

**Parameters**

* **engine**: `HeadlessEngine` (required)

  The `HeadlessEngine` instance of your application.

**Returns** `ResultTemplatesManager<Content, State>`
+
A new result templates manager.

#### Methods

##### `registerTemplates`

Registers any number of result templates in the manager.

**Parameters**

* **templates**: `ResultTemplate<Content>[]` (required)

  The `HeadlessEngine` instance of your application.

**Returns** `void`

##### `selectTemplate`

Selects the highest priority template for which the given result satisfies all conditions.
In the case where satisfied templates have equal priority, the template that was registered first is returned.

**Parameters**

* **result**: `Result` (required)

  The `HeadlessEngine` instance of your application.

**Returns** `Content | null`
+
The selected template’s content, or null if no template’s conditions are satisfied.