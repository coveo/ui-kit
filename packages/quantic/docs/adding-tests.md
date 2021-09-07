# Adding Tests

Let's say you just finished coding the `quantic-greeting` component. This simple component displays a greeting message and accepts a name as an option like the following example:

```html
<c-quantic-greeting name="Alex"></c-quantic-greeting>

<!-- Which outputs: Hello Alex! -->
```

## Updating the Quantic Examples community

Now you wish to make this component available in the `Quantic Examples` community and add end to end tests to prevent any regression. To achieve that, you want a community page containing your example component, and a configuration panel allowing to modify the `name` option.

Luckily, there are some components that can help you.

- the `exampleLayout` LWC component acts as a master page, so all component pages can share the same structure and style.
- the `configurator` LWC component renders a form allowing the user to specify option values. You can create your own configurator component, but the generic one works for most cases.

Now you need to create an LWC component that ties everything together. Here is the resulting `exampleQuanticGreeting` component:

```html
<!-- force-app/examples/main/lwc/exampleQuanticGreeting/exampleQuanticGreeting.html -->

<template>
    <c-example-layout
        title={pageTitle}
        description={pageDescription}
        show-preview={isConfigured}>

        <c-configurator slot="configuration" options={options} ontryitnow={handleTryItNow}></c-configurator>

        <c-quantic-greeting slot="preview" name={config.name}></c-quantic-greeting>
    </c-example-layout>
</template>
```

```javascript
// force-app/examples/main/lwc/exampleQuanticGreeting/exampleQuanticGreeting.js

import {LightningElement, track} from 'lwc';

export default class ExampleQuanticGreeting extends LightningElement {
    // `config` stores the options retrieved from the configurator. 
    @track config = {}
    isConfigured = false;

    pageTitle = 'Quantic Greeting';
    pageDescription = 'The Quantic Greeting renders a greeting message given a name.';

    // `options` is used by `configurator` to render the configuration form.
    options = [
        {
            attribute: 'name',
            label: 'Name',
            description: 'The name to display in the greeting message.',
            defaultValue: 'World'
        }
    ];

    handleTryItNow(evt) {
        this.config = evt.detail;

        // Setting this to `true` makes the `preview` slot visible,
        // which also loads the Quantic component with the configured options.
        this.isConfigured = true;
    }
}
```

```xml
<!-- force-app/examples/main/lwc/exampleQuanticGreeting/exampleQuanticGreeting.js-meta.xml -->

<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>50.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
      <target>lightning__RecordPage</target>
      <target>lightning__AppPage</target>
      <target>lightning__HomePage</target>
      <target>lightningCommunity__Page</target>
      <target>lightningCommunity__Default</target>
  </targets>
</LightningComponentBundle>
```

Deploy the example components to your org.

Open the community builder, then create a `Quantic Greeting` page and drop your `exampleQuanticGreeting` component into it.

Don't forget to also update the community home page to add a link to your page.

Publish your changes and validate that everything works as expected.

It is now time to backup the changes you made to the community. Run:

```bash
sfdx force:mdapi:retrieve -u LWC -k quantic-examples-community/package.xml -r temp -w 10
```

Executing this command will download the community configuration from your org and save it as `temp/unpackaged.zip`.

Finally, extract the `siteDotComSites/Quantic_Examples1.site` file, and overwrite the `quantic-examples-community/siteDotComSites/Quantic_Examples1.site` file.

**Important** `Quantic_Examples1.site` is a binary file, so be careful not to lose changes when merging branches. If a conflict occur, you need to manually include both community changes in a single scratch org, and then retrieve the community binary file. If you plan on adding tests for many new components, you might prefer to add all the example pages first (as a single batch), and then have separate branches for the end to end tests.

## Write Your Test Suite

You are now ready to write the Cypress tests for your component. All tests should be added in `cypress/integration`. For our example, we create a `cypress/integration/quantic-greeting.cypress.ts` file.

Let's walk through a simple test case.

```typescript
// cypress/integration/quantic-greeting.cypress.ts

import {configure} from '../page-objects/configurator';

describe('quantic greeting', () => {
  it('should display greeting message with specified name', () => {
    // `examplesUrl` is set from `cypress/plugins/config/examples-community.json`
    cy.visit(`${Cypress.env('examplesUrl')}/s/quantic-greeting`)

      // The `configure` function sets the options and then clicks the `Try it now` button.
      // When specifying an option, you must use the HTML attribute name (e.g., `no-search`).
      // For example: `() => configure({ 'no-search': 'true' })`
      .then(() => configure({name: 'Alex'}))

      // The test component is now initialized with the correct options.
      .get('c-quantic-greeting')

      // And you can validate it displays the right greeting message.
      .should('contain', 'Hello Alex!');
  });
});
```

**Tip** As soon as you create the test file, run `npm run cypress:open` to see your tests run live as you write it. Writing and debugging your tests is much more efficient this way.
