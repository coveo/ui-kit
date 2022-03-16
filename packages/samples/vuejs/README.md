# Vue.js Search Page

This code sample was created to provide developers with a minimal working page that exemplifies the configuration and implementation of the atomic library in a Vue.js application.

## Project setup

If you would like to test it, you will need to run it locally by following the steps below:

```sh
npm install
npm run serve
```

## Using atomic

You can either install the npm package or add it to your page via CDN. The configuration below is the same for both, however the usage differs slightly.

You might have a preference, or need to use one or the other based on how your project is built, however there is one case where you will need to use the CDN, and that is if your project uses [Vite](https://vitejs.dev/) - like projects created using this official [Vue.js tutorial](https://vuejs.org/guide/quick-start.html#with-build-tools). This is due to an issue with Stenciljs detailed [here](https://github.com/ionic-team/stencil/issues/3195)

Usage for both is explained in separate sections in this file.

## Configuration

Add Vue configuration to help it handle atomic's components

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

Add the `html-loader` dev-dependency

```sh
npm install --save-dev html-loader
```

## Using the `@coveo/atomic` npm package

### Add dependencies
Install `@coveo/atomic` with the command

```sh
npm install --save @coveo/atomic
```

Install `ncp`:

```sh
npm install --save-dev ncp
```

> `ncp` is a utility that we will use to copy assets from the atomic project into the vue application, as explained below.

### Copy assets from `@coveo/atomic`

In order for you to be able to leverage everything that atomic has to offer, you will need to copy some assets into your public folder. If you skip this step, some of your dynamic content that is based on localization or svgs will be missing, and you will see some content being displayed as the placeholder 'between-parentheses' instead.

```json
scripts: {
  ...,
  "dev": "npm run copy:assets && npm run serve",
  "copy:assets": "ncp node_modules/@coveo/atomic/dist/atomic/assets public/assets && ncp node_modules/@coveo/atomic/dist/atomic/lang public/lang"
}
```

> The `dev` script assumes you are using the default `serve` script and `public/assets` path for running your application. Don't forget to adjust if needed.

### Update your entry file

The atomic package allows you to customise your components by defining CSS variables in your own stylesheet - you can read about that [here](https://docs.coveo.com/en/atomic/latest/usage/themes-and-visual-customization/).

It also offers you a default theme that you can use as is or build upon. Those styles live in `@coveo/atomic/dist/atomic/themes/coveo.css` and you can import them in your entry file like below.


```ts
import '@coveo/atomic/dist/atomic/themes/coveo.css'; // optional!
import {applyPolyfills, defineCustomElements} from '@coveo/atomic/loader';
import {createApp} from 'vue';
import App from './App.vue';

// Bind the custom elements to the window object [https://stenciljs.com/docs/vue]
applyPolyfills().then(() => {
  defineCustomElements(window);
});

createApp(App).mount('#app');
```

## Using the CDN

> **Note:** If you are trying to use `@coveo/atomic` in a project that runs on [vite](https://vitejs.dev/), as per [this tutorial](https://vuejs.org/guide/quick-start.html#with-build-tools), you might need to [import atomic via cdn](https://vuejs.org/guide/quick-start.html#with-build-tools), as currently there are issues setting up stencils projects using this build tool. In this case, you won't need to add the assets as they will already be available.

&nbsp;

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
