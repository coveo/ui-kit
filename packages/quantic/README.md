# Setup with Salesforce

## Reference documentation

[Useful reference documentation to setup "from scratch"](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_local_dev_setup)

## Create a salesforce developer organization

- [Signup](https://developer.salesforce.com/signup)
- Use your @coveo.com email account. The username can be anything.

## Setup SFDX cli

[SFDX cli](https://developer.salesforce.com/tools/sfdxcli)

## Update SFDX cli plugins

- Run `sfdx plugins:install @salesforce/lwc-dev-server`
- Run `sfdx plugins:update`

## Install vscode extension

[vscode Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)

**Note** Make sure you open the quantic project at the root (`/packages/quantic/`) in vscode in order for the entension to work properly.

## Enable Dev Hub in your Salesforce organization

- Connect to your salesforce developer organization [login](http://login.salesforce.com/)
- From Setup, enter Dev Hub in the Quick Find box and select Dev Hub.
- To enable Dev Hub, click Enable

## Authorize Your Dev Hub

- In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Authorize a Dev Hub.
- You can also run this command from the command line. `sfdx force:auth:web:login -d -a LWC-Hub`
- Running this command opens a browser to the Salesforce login page. Enter your Salesforce username and password. Authorize only once, not every time you work on your project.

## Create a Default Scratch Org

- In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create a Default Scratch Org.
- You can also run this command from the command line. `sfdx force:org:create -s -f config/project-scratch-def.json -a "LWC"`
- `LWC` is an alias for the scratch org that you can use in other Salesforce CLI commands. You can create any alias that you like.

## Start the Local Development Server

Start the server.

- Run `npm run start`
- You can also run this command from the command line. `sfdx force:lightning:lwc:start`
- View the server at http://localhost:3334/.

## Deploy the Quantic Examples Community

Example components are available as a Salesforce community (Digital Experience) allowing you to experiment with Quantic components.

1. To create a community named `Quantic Examples`, run:

    ```bash
    sfdx force:community:create -u LWC -n "Quantic Examples" -p examples -t "Build Your Own"
    ```

2. To deploy Quantic and the example components, run:

    ```bash
    sfdx force:source:deploy -u LWC -p force-app/main,force-app/examples
    ```

3. To deploy the community in the scratch org, run:

    ```bash
    sfdx force:mdapi:deploy -u LWC -d ./quantic-examples-community -w 5
    ```

4. To publish the community, run:

    ```bash
    sfdx force:community:publish -u LWC -n "Quantic Examples" --json
    ```

    The community URL will appear in the console output.

5. Copy the `cypress/plugins/config/examples-community.json.example` to `cypress/plugins/config/examples-community.json`.
   
6. Update the `cypress/plugins/config/examples-community.json` file with the community URL like this:

    ```json
    {
      "env": {
        "examplesUrl": "https://your-salesforce-instance.force.com/examples"
      }
    }
    ```
## Run Cypress for Quantic Components

**Note** Before attempting to run Cypress tests, make sure the `Quantic Examples` community is deployed as described in the previous section.

Ref: [https://docs.cypress.io/](https://docs.cypress.io/)

- All the tests will need to be under folder `cypress/integration`.

To open Cypress in browser mode, run:

```bash
npm run cypress:open
```

## Run Cypress for Quantic Components

Ref: [https://docs.cypress.io/](https://docs.cypress.io/)

- All the tests will need to be under folder `cypress/integration`


To start the local development server, run:

```bash
npm run start
```

To open Cypress in browser mode, run:

```bash
npm run cypress:open
```


## Use Quantic From Source

After you have cloned the repository and have run `npm install`, run the following commands:

- `npm run copy:staticresources`
- `sfdx force:source:deploy -m LightningComponentBundle`

## Other useful commands

- `-m LightningComponentBundle` can be changed for different types of "resources". To know which name, check the related `meta.xml` file for each type of resource.
- Create new web components. In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create Lightning Web Component.

## Learn about LWC

- [lwc.dev](https://lwc.dev/)
- [Components reference](https://developer.salesforce.com/docs/component-library/overview/components). Make sure you stay in the "Lightning web components section". Aura does not apply. Aura is the older UI library that is being deprecated by Salesforce.
- [Lightning design system](https://www.lightningdesignsystem.com/). Reference for styling, CSS utilities, icons, and more.
