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

- Run `npm install --global @salesforce/cli@2.x`
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

### Single command run

- Make sure you are at the root of `packages/quantic`.
- Run `npm run scratch:dev`.
- You should now have a scratch org with Quantic and the test community deployed. Watch your commandline for the url to the examples community.

Or you can run the individual commands below.

#### Create a Default Scratch Org

- Make sure you are in the `packages/quantic` root folder.
- Run this command to create the default scratch org. `npm run scratch:create`.
- In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create a Default Scratch Org.
- You can also run this command from the command line. `sf org create scratch --set-default --definition-file config/project-scratch-def.json --alias "LWC"`
- `LWC` is an alias for the scratch org that you can use in other Salesforce CLI commands. You can create any alias that you like.

#### Deploy the Quantic code

- Run this command from the command line. `sf project deploy start --source-dir force-app/main`.

## Testing

### Deploy the Quantic Examples Community

Example components are available as a Salesforce community (Digital Experience) allowing you to experiment with Quantic components.

To setup the community in the `LWC` scratch org, run:

```bash
npm run setup:examples
```

This script creates, configures, and deploys everything required to have fully working examples. The community URL is provided at the end of the script output, as in the following example:

```
...

The 'Quantic Examples' community is ready, you can access it at the following URL:
https://your-salesforce-scratch-org-instance.force.com/examples

To open Cypress, run:
npm run e2e:watch
```

Once the community has been deployed, you can deploy the `main` or `example` components only when needed. To do so, run:

```bash
npm run deploy:main
npm run deploy:examples
```

### Run Cypress for Quantic Components

**Note** Before attempting to run [Cypress](https://docs.cypress.io) tests, make sure the `Quantic Examples` community is deployed as described in the previous section.

To learn how to add tests, see [adding tests](./docs/adding-tests.md).

- All the tests will need to be under folder `cypress/integration`.

To open Cypress in browser mode, run:

```bash
npm run e2e:watch
```

To run Cypress tests directly in your console, run:

```bash
npm run e2e
```

To get the [detailed report](./docs/detailed-reporting.md), run:

```bash
npm run e2e:detailed
```

### Run LWC unit tests for Quantic Components

To run LWC unit tests directly in your console, run:

```bash
npm run test:unit
```

To run specific file/components LWC unit tests directly in your console, run:

```bash
npm run test:unit -p force-app/main/default/lwc/nameOfComponent/
```

## Use Quantic From Source

After you have cloned the repository and have run `npm install`, run the following commands:

- `npm run build`
- `sf project deploy start --source-dir force-app/main/default`

## Other Useful Commands

- `sf project deploy start --metadata LightningComponentBundle`
- `--metadata LightningComponentBundle` can be changed for different types of "resources". To know which name, check the related `meta.xml` file for each type of resource.
- Create new web components. In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create Lightning Web Component.

## Learn About LWC

- [lwc.dev](https://lwc.dev/)
- [Components reference](https://developer.salesforce.com/docs/component-library/overview/components). Make sure you stay in the "Lightning web components section". Aura does not apply. Aura is the older UI library that is being deprecated by Salesforce.
- [Lightning design system](https://www.lightningdesignsystem.com/). Reference for styling, CSS utilities, icons, and more.
