# Vue.js Search Page

This code sample was created to provide developers with a minimal working page that exemplifies the configuration and implementation of the Atomic library in a Vue.js application.

## Project setup

To test it, run it locally by following the steps below:

```sh
npm install
npm run dev
```

## Using Atomic

You can either install the npm package or add it to your page via CDN. The configuration below is the same for both, however the usage differs slightly.

If you are using the npm package and seeing the warning bellow, you might want to switch to using the CDN, as there is currently [a small issue](https://github.com/ionic-team/stencil/issues/3195) with Stencil and Vite. This shouldn't affect the application however, and you can suppress the warning if you prefer.

```txt
The above dynamic import cannot be analyzed by vite.
See [Rollup limitations](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations) for supported dynamic import formats. If this is intended to be left as-is, use the /* @vite-ignore */ comment inside the import() call to suppress this warning.
```

Usage for both the npm package and CDN are explained in separate sections further in this file.

## Configuration

1. Add Vue configuration to help it handle Atomic components.

```patch
// vite.config.ts
export default defineConfig({
-  plugins: [vue()],
+  plugins: [
+    vue({
+      template: {
+        compilerOptions: {
+          // treat all tags with a dash as custom elements
+          isCustomElement: (tag) => tag.startsWith('atomic-'),
+        },
+      },
+    }),
+  ],
})
```

2. Includes `.html` files into the static assets to load result templates

```patch
// vite.config.ts
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.startsWith('atomic-'),
        },
      },
    }),
  ],
+ // Includes html files into the static assets to load the result templates files.
+ assetsInclude: ['**/*.html'],
})
```

## Using the `@coveo/atomic` npm package

### Add dependencies

Install `@coveo/atomic`

```sh
npm install --save @coveo/atomic
```

Install `ncp`

```sh
npm install --save-dev ncp
```

> `ncp` is a utility that we will use to copy assets from the atomic project into the Vue application, as explained below.

### Copy assets from `@coveo/atomic`

To leverage everything that Atomic has to offer, you will need to copy some assets into your public folder. If you skip this step, some of your dynamic content that is based on localization or SVGs will be missing, and you will see some content being displayed as the placeholder 'between-parentheses' instead.

```json
scripts: {
  ...,
  "dev": "npm run build:assets && npm run serve",
  "build:assets": "ncp node_modules/@coveo/atomic/dist/atomic/assets public/assets && ncp node_modules/@coveo/atomic/dist/atomic/lang public/lang"
}
```

> The `dev` script assumes you are using the default `serve` script and `public/assets` path to run your application. Don't forget to adjust if needed.

### Update your entry file

The Atomic package allows you to customize your components by defining CSS variables in your own stylesheet (see [Themes and Visual Customization](https://docs.coveo.com/en/atomic/latest/usage/themes-and-visual-customization/)).

It also offers you a default theme that you can use as is or build upon. Those styles live in `@coveo/atomic/themes/coveo.css` and you can import them in your entry js file as follows.

```ts
import {applyPolyfills, defineCustomElements} from '@coveo/atomic/loader';
// optional!
import '@coveo/atomic/themes/coveo.css';
import {createApp} from 'vue';
import App from './App.vue';

// Bind the custom elements to the window object [https://stenciljs.com/docs/vue]
await applyPolyfills();
defineCustomElements(window);

createApp(App).mount('#app');
```

## Using the CDN

Follow the [instructions](https://docs.coveo.com/en/atomic/latest/usage/#cdn) to add the CDN script to your entry HTML file. The script will initialize your components, avoiding the need to manually do so as in the npm package usage above. You will also not need to copy any assets over.

## Initializing your search interface

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

As you are aware, Vue treats the `<template>` tag as a container for Vue components and therefore doesn't render it to the page. This poses an obstacle for working with the `<atomic-result-template>`, which expects a native `<template>` that it will then use to create each result element. In order for this to work, your result templates will need to live in an HTML file (like in this example's `src/templates/result-template.html` file) and then imported and used like below

> Note: Do append `?raw` in the import URI of the template, so that it's loaded as raw text.

```html
<!-- .vue component -->
<script setup lang="ts">
  import resultTemplate from '../templates/result-template.html?raw';
</script>

<template>
  <atomic-result-list>
    <atomic-result-template v-html="resultTemplate"></atomic-result-template>
  </atomic-result-list>
</template>
```

### Using custom components

Writing your own components to leverage Vue components should be as straightforward as using Atomic components on any other page. However, it becomes a little bit trickier when you want to use a custom Vue component inside your result templates which, as shown above, need to be passed down as raw HTML.

For example, in this project we defined the simple `ResultTextField` component, which takes a `label` and a `field` as `props` and render some Atomic components.

```html
<!-- ResultTextField.vue -->
<script setup lang="ts">
  const props = defineProps({
    label: String,
    field: String,
  });
</script>

<template>
  <atomic-text :value="props.label"></atomic-text>:
  <atomic-result-text :field="props.field"></atomic-result-text>
</template>
```

If you try to use this component in an html template like the snippet below, and then try to use it in the component further below it, Vue will not attempt to render it. The reason is that Vue it expects only native HTML to be passed via the `v-html` directive.

```html
<!-- templates/result-template.html -->
<template>
  <atomic-result-fields-list>
    <atomic-field-condition class="field" if-defined="cat_platform">
      <result-text-field
        label="Platform"
        field="cat_platform"
      ></result-text-field>
    </atomic-field-condition>
    <atomic-field-condition class="field" if-defined="cat_condition">
      <result-text-field
        label="Condition"
        field="cat_condition"
      ></result-text-field>
    </atomic-field-condition>
    <atomic-field-condition class="field" if-defined="cat_categories">
      <result-text-field
        label="Tags"
        field="cat_categories"
      ></result-text-field>
    </atomic-field-condition>
  </atomic-result-fields-list>
</template>
```

```html
<!-- .vue component -->
<script setup lang="ts">
  import resultTemplate from '../templates/result-template.html?raw';
</script>

<template>
  <atomic-result-list>
    <atomic-result-template v-html="resultTemplate"></atomic-result-template>
  </atomic-result-list>
</template>
```

The solution is to import your component and define it as a custom element in the browser. In your entry js file, make sure to define your element with the Vue helper function and then define it in the browser with the native `customElements.define` function. By doing this, the snippets above will work and you can use your Vue components in HTML templates.

```js
// handy helper function that transforms a vue component into something the browser can use
import {defineCustomElement} from 'vue';
// custom component that you want to use inside your HTML template
import ResultTextField from './components/ResultTextField.vue';

const resultTextField = defineCustomElement(ResultTextField);

// `customElements.define` is native to the browser
customElements.define('result-text-field', resultTextField);
```
