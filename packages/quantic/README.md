# Coveo Quantic

## Using the Library

[How to use the Coveo Quantic Library](https://docs.coveo.com/en/quantic/latest/)

[Install Coveo Quantic as a Salesforce unlocked package](https://docs.coveo.com/en/quantic/latest/usage/#install-quantic)

## Contributing

### Create a Salesforce Developer Organization

- [Sign up](https://developer.salesforce.com/signup)
- Use your @coveo.com email account. The username can be anything.

### Setup SFDX CLI

[Salesforce cli](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm#sfdx_setup_install_cli_npm)

- Run `pnpm add --global @salesforce/cli@2.x`
- Optional: [Setup CLI autocomplete](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_autocomplete.htm)

### Update SFDX CLI Plugins

- Run `sf plugins update`

### Install VSCode Extension

Optionally install the [VSCode Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) if you do not want use the equivalent `Salesforce cli` commands to setup.

**Note** Make sure you open the quantic project at the root (`/packages/quantic/`) in vscode in order for the extension to work properly.

### Enable Dev Hub in Your Salesforce Organization

- Connect to your salesforce developer organization [login](http://login.salesforce.com/)
- From Setup, enter Dev Hub in the Quick Find box and select Dev Hub.
- To enable Dev Hub, click Enable

### Authorize Your Dev Hub

- In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Authorize a Dev Hub.
- You can also run this command from the command line. `sf org login web --set-default-dev-hub --alias LWC-Hub`
- Running this command opens a browser to the Salesforce login page. Enter your Salesforce username and password. Authorize only once, not every time you work on your project.

### Single Command Run

- Make sure you are at the root of `packages/quantic`.

- Run `pnpm run setup:examples`.

This command will create two scratch orgs for you:

- One with Lightning Web Security (LWS) enabled. (Alias: `Quantic__LWS_enabled`)

- One with LWS disabled, Locker Service enabled. (Alias: `Quantic__LWS_disabled`)

Each scratch org will include:

- All **Quantic components**
- The **example components**
- An **example Quantic community** featuring:
  - 🧪 **Component playgrounds**
  - 💡 **Solution examples**

To access the links to the created communities, check the generated `.env` file after the script completes.

Or you can run the individual commands below.

#### Create a Default Scratch Org

- Make sure you are in the `packages/quantic` root folder.
- Run this command to create the default scratch org. `pnpm run scratch:create`.
- In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create a Default Scratch Org.
- You can also run this command from the command line. `sf org create scratch --set-default --definition-file config/lws-enabled-scratch-def.json --alias Quantic__LWS_enabled`
- `Quantic__LWS_enabled` is an alias for the scratch org that you can use in other Salesforce CLI commands. You can create any alias that you like.

#### Deploy the Quantic code

- Run this command from the command line. `sf project deploy start --source-dir force-app/main`.

## Testing

### Deploy the Quantic Examples Communities

Example components are available as Salesforce communities (Digital Experiences), allowing you to experiment with Quantic components in two separate environments: one with Lightning Web Security (LWS) enabled and one with LWS disabled.

To set up both communities in scratch orgs, run:

```bash
pnpm run setup:examples
```

This script creates, configures, and deploys everything required to have fully working examples in **two scratch orgs**:

- An org with **LWS enabled**.
- An org with **LWS disabled**.

At the end of the script, the URLs for the two communities are provided, as in the following example:

```

The 'Quantic Examples' community (LWS enabled) is ready, you can access it at the following URL:
https://your-salesforce-lws-enabled-scratch-org-instance.force.com/examples

The 'Quantic Examples' community (LWS disabled) is ready, you can access it at the following URL:
https://your-salesforce-lws-disabled-scratch-org-instance.force.com/examples

```

Once the community has been deployed, you can deploy the `main` or `example` components to a specific org only when needed by running the corresponding commands:

```bash
pnpm run deploy:main --target-org Quantic__LWS_enabled
pnpm run deploy:examples --target-org Quantic__LWS_enabled
```

You can replace Quantic\_\_LWS_enabled with your target org alias. For example:

```bash
pnpm run deploy:main --target-org MyCustomOrg
pnpm run deploy:examples --target-org MyCustomOrg
```

### Run Playwright for Quantic Components

**Note** Before attempting to run [Playwright](https://playwright.dev/) tests, make sure the `Quantic Examples` community is deployed as described in the previous section in both orgs, the one where LWS is enabled and the one where it is disabled.

**Note** For more information on how to add tests, please refer to our [Quantic Testing Strategy](https://github.com/coveo/ui-kit/blob/main/packages/quantic/decisions/0001-testing-strategy.md), which provides detailed guidelines on testing Quantic components.

To run Playwright tests, run:

```bash
pnpm run e2e:playwright
```

To run Playwright tests only for the scratch org where LWS is enabled, run:

```bash
pnpm run e2e:playwright:lws-enabled
```

To run Playwright tests only for the scratch org where LWS is disabled, run:

```bash
pnpm run e2e:playwright:lws-disabled
```

### Run LWC unit tests for Quantic Components

To run LWC unit tests directly in your console, run:

```bash
pnpm run test:unit
```

To run specific file/components LWC unit tests directly in your console, run:

```bash
pnpm run test:unit -p force-app/main/default/lwc/nameOfComponent/
```

## Use Quantic From Source

After you have cloned the repository and have run `pnpm install`, run the following commands:

- `pnpm run build`
- `sf project deploy start --source-dir force-app/main/default`

## Other Useful Commands

- `sf project deploy start --metadata LightningComponentBundle`
- `--metadata LightningComponentBundle` can be changed for different types of "resources". To know which name, check the related `meta.xml` file for each type of resource.
- Create new web components. In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create Lightning Web Component.

## Learn About LWC

- [lwc.dev](https://lwc.dev/)
- [Components reference](https://developer.salesforce.com/docs/component-library/overview/components). Make sure you stay in the "Lightning web components section". Aura does not apply. Aura is the older UI library that is being deprecated by Salesforce.
- [Lightning design system](https://www.lightningdesignsystem.com/). Reference for styling, CSS utilities, icons, and more.
