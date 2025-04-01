[![npm version](https://badge.fury.io/js/@coveo%2Fatomic-react.svg)](https://badge.fury.io/js/@coveo%2Fatomic-react)

# Atomic React

A React component library for building modern UIs interfacing with the Coveo platform. Atomic React is a wrapper around the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web component library.

The integration of React-based projects (using JSX) with Web based components can be tricky. This project is meant to address this issue, making it possible to use Atomic web-components in a manner that feels more natural to developers familiar with React.

## Installation

`npm i @coveo/atomic-react`

### Alternate installation — CDN

The library is also available in the Coveo CDN as an `IIFE` (Immediately Invoked Function Expression). This is an approach that we recommend only for quick prototyping and testing, and that can be used with very minimal front-end tooling and build tools.

We recommend against using the `IIFE` approach in production. The browser has to download the entire library code, regardless of which components are actually used. We rather recommend using a bundler in this situation (for example Webpack).

You can read more about this approach [below](#usage-with-cdn-scripts--iife-).

## Usage

Since Atomic React is built on top of the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web-components library, the vast majority of concepts that apply to core Atomic will apply to Atomic React.

However, there are still some special considerations.

## Entry points

The `@coveo/atomic-react` package exposes the following entry points:

- `@coveo/atomic-react`: exports the components and utilities for building non-commerce search interfaces with Atomic React.
- `@coveo/atomic-react/recommendation`: exports the components and utilities for building non-commerce recommendation interfaces with Atomic React.
- `@coveo/atomic-react/commerce`: exports the components and utilities for building commerce applications with Atomic React.

## Static Assets - Languages and SVGs

For performance reasons, the generated JavaScript bundle does not automatically include static assets that are loaded on demand. This impacts language support, as well as the use of included SVG icons.

It is mandatory that you make available external assets distributed with Atomic React by including them in the public directory of your app. Without this, for example, labels in the app will appear as temporary placeholders.

The location of the public directory depends on how you build, configure and distribute your app.

For example, for any project created with [Create React App](https://github.com/facebook/create-react-app), this would mean copying language and icon assets to the `./public` directory.

```
cp -r node_modules/@coveo/atomic-react/dist/assets public/assets
cp -r node_modules/@coveo/atomic-react/dist/lang public/lang
```

It is important to respect the folder hierarchy, with SVG icons under the `assets` subdirectory, and labels and languages under the `lang` subdirectory of the public folder.

## Result templates

Rendering different types of result templates based on the type of content returned by the Coveo platform is very common when building a Coveo search page.

The way to create result templates for an HTML project using the [core Atomic library](https://docs.coveo.com/en/atomic/latest/usage/displaying-results/#defining-a-result-template) involves defining one or multiple `atomic-result-template` components, configured with HTML properties, adding conditions on the attributes and metadata of each results.

Coupled with the [`<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) HTML tag, this works very well in a pure HTML project.

However, this can be limiting and awkward to use in a React project using JSX.

For every kind of search interface element, Atomic React exposes a wrapper: `AtomicResultList`, `AtomicFoldedResultList`, or `AtomicSearchBoxInstantResults`. These wrappers require a `template` property that can be used in a more straightforward manner when coupled with JSX.

The `template` property accepts a function with either a `Result` parameter in the case of the `AtomicResultList` and `AtomicSearchBoxInstantResults` wrappers, or a `FoldedResult` parameter in the case of the `AtomicFoldedResultList` wrapper. Use those parameters to conditionally render different templates based on properties and fields available in result items.

The `template` function must then simply return a valid JSX Element.

Here is an example of a fictitious search page, which defines some premade templates for YouTube videos, as well as Salesforce cases:

<!-- cSpell:disable -->

```tsx
import {
  Result,
  AtomicResultSectionVisual,
  AtomicResultImage,
  AtomicResultSectionTitle,
  AtomicResultLink,
  AtomicResultSectionBottomMetadata,
  AtomicText,
  AtomicResultNumber,
  AtomicFormatUnit,
  AtomicResultSectionExcerpt,
  AtomicResultText,
  AtomicResultSectionEmphasized,
  AtomicSearchInterface,
  AtomicResultList,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/atomic-react';
import {useMemo} from 'react';

const MyResultTemplateForYouTubeVideos: React.FC<{result: Result}> = ({
  result,
}) => {
  return (
    <>
      <AtomicResultSectionVisual>
        <AtomicResultImage field="ytthumbnailurl" />
      </AtomicResultSectionVisual>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      {result.raw.ytvideoduration !== undefined && (
        <AtomicResultSectionBottomMetadata>
          <AtomicText value="Duration" />
          <AtomicResultNumber field="ytvideoduration">
            <AtomicFormatUnit unit="minute" />
          </AtomicResultNumber>
        </AtomicResultSectionBottomMetadata>
      )}
    </>
  );
};

const MyResultTemplateForSalesforceCases: React.FC<{result: Result}> = ({
  result,
}) => {
  return (
    <>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionExcerpt>
        <AtomicResultText field="excerpt" />
      </AtomicResultSectionExcerpt>
      <AtomicResultSectionEmphasized>
        {result.raw.sfpriority !== undefined && (
          <>
            <AtomicText value="Priority" />
            <AtomicResultText field="sfpriority" />
          </>
        )}
        {result.raw.sfstatus !== undefined && (
          <>
            <AtomicText value="Status" />
            <AtomicResultText field="sfstatus" />
          </>
        )}
      </AtomicResultSectionEmphasized>
    </>
  );
};

const MyDefaultTemplate: React.FC<{}> = () => {
  return (
    <>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionExcerpt>
        <AtomicResultText field="excerpt" />
      </AtomicResultSectionExcerpt>
    </>
  );
};

const MyResultTemplateFunction = (result: Result) => {
  if (result.raw.filetype === 'YoutubeVideo') {
    return <MyResultTemplateForYouTubeVideos result={result} />;
  }

  if (result.raw.objecttype === 'Case') {
    return <MyResultTemplateForSalesforceCases result={result} />;
  }

  return <MyDefaultTemplate />;
};

const MyPage = () => {
  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: getSampleSearchEngineConfiguration(),
      }),
    []
  );

  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicResultList template={MyResultTemplateFunction} />
    </AtomicSearchInterface>
  );
};
```

<!-- cSpell:enable -->

## Styling Result Template Components

Due to the way Atomic Web components use [Shadow Dom](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) and [CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) to provide encapsulation, it is necessary to follow these guidelines when you wish to style elements inside any result template.

### Option 1 -- Using Higher-Order Components (HOC)

This option works well if you do not need to create any CSS rule that would need to target the Shadow parts of an Atomic result component.

For example, if you want to modify the color of all result links in a template to `pink`, you could do so like this:

```tsx
import {
  AtomicResultLink,
  AtomicSearchInterface,
  AtomicResultList,
} from '@coveo/atomic-react';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {useMemo} from 'react';

const MyStyledResultLink: React.FC<
  React.ComponentProps<typeof AtomicResultLink>
> = (props) => {
  return (
    <AtomicResultLink {...props} style={{color: 'pink'}}>
      {props.children}
    </AtomicResultLink>
  );
};

const MyPage = () => {
  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: getSampleSearchEngineConfiguration(),
      }),
    []
  );

  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicResultList
        template={(result) => {
          return <MyStyledResultLink />;
        }}
      />
    </AtomicSearchInterface>
  );
};
```

This approach lets you wrap any core Atomic component inside a styled one, which you can then re-use in one or more templates.
This could be done with inline styling as shown here, or with more advanced techniques such as using CSS modules.

Using `React.ComponentProps<typeof AnyAtomicComponent>` allows you to extract any props that the core component exposes, and augment them if need be.

### Option 2 -- Using a style tag

This option works in all scenarios, and allows you to target any Shadow parts that an Atomic result component exposes, in a similar manner to using plain HTML.

The following is an example that makes the text of an `AtomicResultBadge` pink:

```tsx
import {
  AtomicSearchInterface,
  AtomicResultList,
  AtomicResultBadge,
} from '@coveo/atomic-react';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {useMemo} from 'react';

const myStyles = `
atomic-result-badge::part(result-badge-element) {
    color: pink;
}
`;

const MyPage = () => {
  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: getSampleSearchEngineConfiguration(),
      }),
    []
  );

  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicResultList
        template={(result) => (
          <>
            <style>{myStyles}</style>
            <AtomicResultBadge />
          </>
        )}
      />
    </AtomicSearchInterface>
  );
};
```

## Localization (i18n)

The Atomic React search interface component exposes an optional `localization` option, which takes a callback function that lets you handle [localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/).

```tsx
import {AtomicSearchInterface} from '@coveo/atomic-react';

<AtomicSearchInterface
  localization={(i18n) => {
    i18n.addResourceBundle('en', 'translation', {
      search: "I'm feeling lucky!",
    });
  }}
></AtomicSearchInterface>;
```

## Usage with CDN Scripts (IIFE)

For this approach to work, you need to pull different scripts in the page in the correct order, using proper external dependencies with matching versions.

First, identify the required versions of `@coveo/atomic`, `@coveo/headless`, `react` and `react-dom` that are used by `@coveo-atomic-react`.

You can do that by running `npm view @coveo/atomic-react@latest version dependencies devDependencies peerDependencies`, like so:

```
$ npm view @coveo/atomic-react@latest version dependencies devDependencies peerDependencies

version = '2.1.35'
dependencies = { '@coveo/atomic': '2.19.16' }
devDependencies = {
  '@coveo/headless': '2.8.10',
  '@rollup/plugin-commonjs': '^22.0.2',
  '@rollup/plugin-node-resolve': '^14.1.0',
  '@rollup/plugin-replace': '^4.0.0',
  '@rollup/plugin-typescript': '^8.5.0',
  '@types/node': '15.14.9',
  '@types/react': '18.0.17',
  '@types/react-dom': '18.0.6',
  ncp: '2.0.0',
  react: '18.2.0',
  'react-dom': '18.2.0',
  rollup: '^2.79.0',
  'rollup-plugin-polyfill-node': '^0.10.2',
  'rollup-plugin-terser': '^7.0.2'
}
peerDependencies = {
  '@coveo/headless': '^2.0.0',
  react: '>=18.0.0',
  'react-dom': '>=18.0.0'
}
```

In the above example, you can see that, as of the time of this writing:

- The current latest version of `@coveo/atomic-react` is `2.1.35`.
- The current latest version is using `@coveo/atomic` at version `2.19.16`.
- The current latest version is using `@coveo/headless` at version `2.8.10`.
- The current latest version is using `react`/`react-dom` at version 18 and above.

Then, we need to add the required dependencies in our page. You can do that like so:

```html
<head>
  <!-- React, ReactDOM and ReactDOMServer need to be included  -->
  <script
    crossorigin
    src="https://unpkg.com/react@18/umd/react.production.min.js"
  ></script>
  <script
    crossorigin
    src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
  ></script>
  <script
    crossorigin
    src="https://unpkg.com/react-dom@18/umd/react-dom-server-legacy.browser.production.min.js"
  ></script>

  <!-- Optional script, which allows to use JSX directly in an inline script in the page -->
  <script
    crossorigin
    src="https://unpkg.com/@babel/standalone@7/babel.min.js"
  ></script>

  <!-- @coveo/headless need to be included as a dependency -->
  <!-- Note the matching major and minor version as explained above -->
  <script
    crossorigin
    src="https://static.cloud.coveo.com/headless/v2.8/headless.js"
  ></script>

  <!-- @coveo/atomic need to be included as a dependency -->
  <!-- Note the matching major and minor version as explained above -->
  <script
    crossorigin
    type="module"
    src="https://static.cloud.coveo.com/atomic/v2.19/atomic.esm.js"
  ></script>

  <!--And then finally @coveo/atomic-react is included -->
  <!-- Note the matching major and minor version as explained above -->
  <script
    crossorigin
    src="https://static.cloud.coveo.com/atomic-react/v2.1/iife/atomic-react.min.js"
  ></script>
</head>
```

Once this is done, you can start using `CoveoAtomicReact` directly with an inline script tag:

```html
<!doctype html>
<html>
  <head>
    [...]
  </head>
  <body>
    <div id="container"></div>
  </body>
  <script type="text/babel">
    'use strict';

    const {buildSearchEngine} = CoveoHeadless;

    const {
      buildSearchEngine,
      AtomicSearchInterface,
      AtomicSearchBox,
      AtomicResultList
    } = CoveoAtomicReact;

    class SearchPage extends React.Component {
      constructor(props) {
        super(props);
        // Configure engine
        this.engine = buildSearchEngine({...});
      }

      render() {
        return (
          <AtomicSearchInterface engine={this.engine}>
            <AtomicSearchBox />
            <AtomicResultList
              template={MyTemplateFunction}
            />
            [... etc ...]
          </AtomicSearchInterface>
        );
      }
    }

    const domContainer = document.querySelector('#container');
    ReactDOM.createRoot(domContainer).render(<SearchPage />);
  </script>
</html>
```
