# Atomic Custom Components Project

This is a starter project for building web components for Coveo Atomic using Stencil.

## Getting Started

<!-- TODO CDX-1358: Insert instruction to create other components -->

If you used `npm init @coveo/atomic-component` or `npm init @coveo/atomic-result-component`, your component should already be in `src/components`.
You can use either of these commands at the root of your project to add another component.

Visit [Create a custom component](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/#create-a-custom-component) for more information

## Testing your components locally

You can test your component locally by adding it to `src/pages/index.html`.
The code of the component should already be included. You just need to add the component tag to the markup of the page.

<!--
    TODO CDX-1356: tldr best practices and/or doc link.
-->

## Using a custom component

There are two strategies we recommend for using custom components.

The first step for both these strategies is to [publish to NPM](https://docs.npmjs.com/getting-started/publishing-npm-packages).

You should run `npm publish` in the directory of the component or use the [workspace flag](https://docs.npmjs.com/cli/v9/using-npm/workspaces#running-commands-in-the-context-of-workspaces) to target it.
If you want your component to stay private, we recommend you publish it either to the official npm registry as a [private package](https://docs.npmjs.com/about-private-packages) or to your own npm registry.

Visit [Publish your custom component](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/#publish-your-custom-component) for publish instructions.

If you do not want your component to be listed on the Atomic Custom Component marketplace, change the keywords field in the package.json of your component before publishing.

### Unpkg script tag

- Put a script tag similar to this `<script type='module' src='https://unpkg.com/my-component@0.0.1/dist/my-component.esm.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

> You cannot use `unpkg` if your component is private.

Visit [Use a published custom component](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/#use-a-published-custom-component) for more information.

### Node Modules

- Run `npm install my-component --save`
- Put a script tag similar to this `<script type='module' src='node_modules/my-component/dist/my-component.esm.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc
