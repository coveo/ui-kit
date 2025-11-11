# Add Tests

This article uses an example to guide you through the steps required to create tests for a component.

Let's say you just finished coding a `quantic-greeting` component, which displays a greeting message and accepts a name as an option. For example:

```html
<c-quantic-greeting name="Alex"></c-quantic-greeting>

<!-- Which outputs: Hello Alex! -->
```

**Note**: The following example assumes all steps are performed on a scratch org aliased as `Quantic__LWS_enabled`.

## Update the Quantic Examples Community

Now, say that you wish to make this component available in the `Quantic Examples` community. Further, say you want to add end to end tests to prevent any regression. To achieve that, you want a community page containing your example component, and a configuration panel allowing users to modify the component's options. In this case, you want to test the `name` option.

Luckily, there are some components that can help you:

- the `exampleLayout` LWC acts as a master page, so all component pages can share the same structure and style.
- the `configurator` LWC renders a form allowing the user to specify option values. You can create your own configurator component, but the generic one works for most cases.

Now you need to create a LWC that ties everything together. Here is the resulting `exampleQuanticGreeting` component:

```html
<!-- force-app/examples/main/lwc/exampleQuanticGreeting/exampleQuanticGreeting.html -->

<template>
  <c-example-layout
    title="{pageTitle}"
    description="{pageDescription}"
    show-preview="{isConfigured}"
  >
    <c-configurator
      slot="configuration"
      options="{options}"
      ontryitnow="{handleTryItNow}"
    ></c-configurator>

    <c-quantic-greeting
      slot="preview"
      name="{config.name}"
    ></c-quantic-greeting>
  </c-example-layout>
</template>
```

```javascript
// force-app/examples/main/lwc/exampleQuanticGreeting/exampleQuanticGreeting.js
import {LightningElement, track} from 'lwc';

export default class ExampleQuanticGreeting extends LightningElement {
  // `config` stores the options retrieved from the configurator.
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Greeting';
  pageDescription =
    'The Quantic Greeting renders a greeting message given a name.';

  // `options` is used by `configurator` to render the configuration form.
  options = [
    {
      attribute: 'name',
      label: 'Name',
      description: 'The name to display in the greeting message.',
      defaultValue: 'World',
    },
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

Next, execute the following steps:

1. Deploy the example components to your org.

```bash
pnpm run deploy:examples --target-org Quantic__LWS_enabled
```

2. Open the community builder, then create a `Quantic Greeting` page and drop your `exampleQuanticGreeting` component into it. Don't forget to also update the community home page to add a link to your page.

3. Publish your changes and validate that everything works as expected.

   ```
    sf community publish --target-org Quantic__LWS_enabled --name "Quantic Examples"
   ```

It is now time to backup the changes you made to the community. Run:

```bash
  sf project retrieve start --target-org Quantic__LWS_enabled --manifest quantic-examples-community/package.xml --output-dir temp --wait 10
```

Executing this command will download the community metadata from your org and save it as `temp/unpackaged.zip`.

Finally, extract the `experiences` folder, and overwrite the content of `quantic-examples-community/experiences`. You should see only your changes in the commit diff.

## Write Your Test Suite

Each component in Quantic has its own folder and E2E test suite under a local e2e/ folder. A typical test suite consists of:

- fixture.ts – Configures the test setup using Playwright fixtures.

- pageObject.ts – Encapsulates selectors and interactions with the component under test.

- quanticGreetings.e2e.ts – The actual test file with test cases using the fixture and page object.

Here’s a simple example for the quantic-greeting component.

### 📁 `lwc/quantic-greeting/e2e/fixture.ts`

```typescript
import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {GreetingObject} from './pageObject';

const pageUrl = 's/quantic-greeting';

interface GreetingOptions {
  name: string;
}

type QuanticGreetingFixtures = {
  greeting: GreetingObject;
  options: Partial<GreetingOptions>;
};

export const test = quanticBase.extend<QuanticGreetingFixtures>({
  options: {name: 'John'},
  greeting: async ({page, options, configuration}, use) => {
    const greeting = new GreetingObject(page);
    await page.goto(pageUrl);
    await configuration.configure({...options});
    await greeting.component.waitFor();
    await use(greeting);
  },
});

export {expect} from '@playwright/test';
```

### 📁 `lwc/quantic-greeting/e2e/pageObject.ts`

```typescript
import type {Locator, Page} from '@playwright/test';

export class GreetingObject {
  constructor(public page: Page) {}

  get component(): Locator {
    return this.page.locator('c-quantic-greeting');
  }

  get greetingMessage(): Locator {
    return this.component.getByTestId('message');
  }
}
```

### 📁 `lwc/quantic-greeting/e2e/quanticGreetings.e2e.ts`

```typescript
import {test, expect} from './fixture';

test.describe('quantic greeting', () => {
  test('should display greeting message with specified name', async ({
    greeting,
  }) => {
    await expect(greeting.greetingMessage).toContainText('Hello John!');
  });
});
```

**Tip** When writing a test, use `describe.only(...)` or `it.only(...)` to focus only on the test at hand.
