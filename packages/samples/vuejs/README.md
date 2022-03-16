# Vue.js Search Page

## Project setup

```sh
npm install
```

### Compiles and hot-reloads for development

```sh
npm run serve
```

### Compiles and minifies for production

```sh
npm run build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

&nbsp;

## Configuring `@coveo/atomic`
&nbsp;

### Add Vue configuration to help it handle atomic's components

```js
// vue.config.js
{
  ...,
  chainWebpack: (config) => {
    // lets us parse html templates, which will be necessary for atomic components that require the native <template> tag
    config.module
      .rule('html')
      .test(/\.html$/)
      .use('html-loader')
      .loader('html-loader');

    // tells Vue to treat any components starting with 'atomic-' as native components, and therefore not try and create Vue components out of them
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => ({
        ...options,
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('atomic-'),
        },
      }));
  }
}
```

### Add dependencies

`html-loader` is necessary for the configuration above to work and
`ncp` is a utility that we will use to copy some assets from the atomic project into the vue project in the next step
```sh
npm install --save-dev ncp html-loader
```

### Add scripts to package.json
In order for you to be able to leverage everything that atomic has to offer, you will need to add the following scripts to your `package.json` file:
```json
scripts: {
  ...,
  "dev": "npm run copy:assets && npm run serve",
  "copy:assets": "ncp node_modules/@coveo/atomic/dist/atomic/assets public/assets && ncp node_modules/@coveo/atomic/dist/atomic/lang public/lang"
}
```
The `dev` script assumes you are using the default `serve` script for running your application.


> **Note:** If you are trying to use `@coveo/atomic` in a project that runs on [vite](https://vitejs.dev/), as per [this tutorial](https://vuejs.org/guide/quick-start.html#with-build-tools), you might need to [import atomic via cdn](https://vuejs.org/guide/quick-start.html#with-build-tools), as currently there are issues setting up stencils projects using this build tool. In this case, you won't need to add the assets as they will already be available.

&nbsp;
## Using `@coveo/atomic`
&nbsp;

In your entry file, import the assets and define atomic custom elements before creating your app.

```ts
import '@coveo/atomic/dist/atomic/themes/coveo.css';
import {applyPolyfills, defineCustomElements} from '@coveo/atomic/loader';
import {createApp} from 'vue';
import App from './App.vue';

applyPolyfills().then(() => {
  defineCustomElements(window);
});

createApp(App).mount('#app');
```

> **Note:** This step is not necessary if you are importing atomic via cdn.

&nbsp;

After you render your search interface, make sure to initialize it

```js
import {onMounted} from 'vue';

async function initInterface() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = document.querySelector(
    'atomic-search-interface'
  ) as HTMLAtomicSearchInterfaceElement;

  // Initialization
  await searchInterface.initialize({
    accessToken: '<YOUR-TOKEN>',
    organizationId: '<YOUR-ORGANIZATION-ID>',
  });

  // Trigger a first search
  searchInterface.executeFirstSearch();
}

onMounted(initInterface);
```

### Using `<atomic-result-template>`

As you are aware, Vue treats the `<template>` tag as a container for Vue components and therefore doesn't render it to the page. This poses an obstacle for working with the `<atomic-result-template>`, which expects a native `<template>` that it will then use to create each result element. In order for this to work, your result templates will need to live in an html file, like in this example's `src/templates/result-template.html` and then imported and used like below

```js
// .vue component
<script setup lang="ts">
import resultTemplate from '../templates/result-template.html';
</script>

<template>
    <atomic-result-list>
      <atomic-result-template v-html="resultTemplate"></atomic-result-template>
    </atomic-result-list>
</template>

```

This, of course, has some limitations such as not allowing you to use vue components directly into the template results. To work around that, we can make use of the helpful `defineCustomElement` function provided by Vue, which you can use in your entry file like so

```js
import {defineCustomElement} from 'vue';
// custom component that you want to use inside your html template
import ResultTextField from './components/ResultTextField.vue';

const resultTextField = defineCustomElement(ResultTextField);
// `customElements.define` is native to the browser
customElements.define('result-text-field', resultTextField);
```

That's enough for you to be able to use a `result-text-field` component and give it props in your html result template.
