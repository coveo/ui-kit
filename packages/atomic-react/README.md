[![npm version](https://badge.fury.io/js/@coveo%2Fatomic-react.svg)](https://badge.fury.io/js/@coveo%2Fatomic-react)

# Atomic React

A React component library for building modern UIs interfacing with the Coveo platform. Atomic React is a wrapper around the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web component library.

The integration of React-based projects (using JSX) with Web based components can be tricky. This project is meant to address this issue, making it possible to use Atomic web-components in a manner that feels more natural to developers familiar with React.

## Installation

`npm i @coveo/atomic-react`

### Alternate installation -- CDN

The library is also available from Coveo's CDN as an `IIFE` (Immediately Invoked Function Expression). This is an approach that we recommend only for quick prototyping and testing, and that can be used with very minimal front end tooling and build tools.

The `IIFE` approach in production is discouraged - the browser has to download the entire library code, regardless of which components are actually used. Using a bundler (for example Webpack) is recommended.

You can read more on this approach down below.
## Usage

Since Atomic React is built on top of the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web-components library, the vast majority of concepts that apply to core Atomic will apply to Atomic React.

However, there are still some special considerations.

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

The way to create result templates for an HTML project using the [core Atomic library](https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/) involves defining one or multiple `atomic-result-template` components, configured with HTML properties, adding conditions on the attributes and metadata of each results.

Coupled with the [`<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) HTML tag, this works very well in a pure HTML project.

However, this can be limiting and awkward to use in a React project using JSX.

For every kind of search interface element, Atomic React exposes a wrapper: `AtomicResultList`, `AtomicFoldedResultList`, or `AtomicSearchBoxInstantResults`. These wrappers require a `template` property that can be used in a more straightforward manner when coupled with JSX.

The `template` property accepts a function with either a `Result` parameter in the case of the `AtomicResultList` and `AtomicSearchBoxInstantResults` wrappers, or a `FoldedResult` parameter in the case of the `AtomicFoldedResultList` wrapper. Use those parameters to conditionally render different templates based on properties and fields available in result items.

The `template` function must then simply return a valid JSX Element.

Here is an example of a fictitious search page, which defines some premade templates for YouTube videos, as well as Salesforce cases:

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
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicResultList template={MyResultTemplateFunction} />
    </AtomicSearchInterface>
  );
};
```

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
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/atomic-react';

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
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
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
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  AtomicSearchInterface,
  AtomicResultList,
  AtomicResultBadge,
} from '@coveo/atomic-react';

const myStyles = `
atomic-result-badge::part(result-badge-element) {
    color: pink;
}
`;

const MyPage = () => {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
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

## Usage with CDN scripts

For this approach to work, different scripts need to be pulled in the page in the correct order, using proper external dependencies with matching versions.

First, identify the version of `@coveo/atomic` that is used by `@coveo-atomic-react`.

This can be done with `npm view @coveo/atomic-react`, and identify the `@coveo/atomic` dependencies:

```
npm view @coveo/atomic-react


@coveo/atomic-react@1.23.11 | Proprietary | deps: 1 | versions: 209
React specific wrapper for the Atomic component library
https://github.com/coveo/ui-kit#readme

dist
.tarball: https://registry.npmjs.org/@coveo/atomic-react/-/atomic-react-1.23.11.tgz
.shasum: 64ba0a5f686e3638b1180910f6fed5e4980bd9e2
.integrity: sha512-/qI5O7SWNinBYWAedRW62ko0oF4c/hfapgqKe9xSq/NJfg+KBzcR3SbdyhpaUAWpPX1910GP9cMyr4wf8irJnQ==
.unpackedSize: 771.1 kB

dependencies:
@coveo/atomic: 1.108.2
```

In the above example, we can see that of the time of this writing, the current latest version of `@coveo/atomic-react` is `1.23.11`, and that it is using `@coveo/atomic` at version `1.108.2`.

Then, the same need to be done for the matching version of `@coveo/headless` used by the matching `@coveo/atomic` version.

Using the above example with `@coveo/atomic@1.108.2`:

```bash
npm view @coveo/atomic@1.108.2


@coveo/atomic@1.108.2 | Apache-2.0 | deps: 15 | versions: 728
A web-component library for building modern UIs interfacing with the Coveo platform
https://docs.coveo.com/en/atomic/latest/

dist
.tarball: https://registry.npmjs.org/@coveo/atomic/-/atomic-1.108.2.tgz
.shasum: 6e844073f55f10328b4b828c0190b8fe31403fbf
.integrity: sha512-LhFR6k7NdGi8pYHmWOq3gM3rE0zeTKc6biTa1Z+ZKr5TEXIr97rpxi1HSnViQUowQYYCcY44dvsAYz2yyPvXTA==
.unpackedSize: 87.1 MB

dependencies:
@coveo/bueno: 0.42.1                  @stencil/store: 1.5.0                 focus-visible: 5.2.0
@coveo/headless: 1.103.3              coveo-styleguide: 9.34.4              i18next-http-backend: 1.4.1
@popperjs/core: ^2.11.6               dayjs: 1.11.5                         i18next: 20.6.1
@salesforce-ux/design-system: ^2.16.1 dompurify: 2.3.10                     stencil-inline-svg: 1.1.0
@stencil/core: 2.17.3                 escape-html: 1.0.3                    ts-debounce: ^4.0.0

```

In the above example, we can see that that `@coveo/atomic@1.108.2` has a dependency on `@coveo/headless@1.103.3`.

In summary, as of the time of this writing, the versions that we should keep in mind are the following:

- `@coveo/atomic-react` -> 1.23.11
- `@coveo/atomic` -> 1.108.2
- `@coveo/headless` -> 1.103.3

```html
<head>
  <!-- React and ReactDOM need to be included  -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Optional script, which allows to use JSX directly in an inline script in the page -->
  <script crossorigin src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

  <!-- @coveo/headless need to be included as a dependency -->
  <!-- Note the matching major and minor version as explained above -->
  <script crossorigin src="https://static.cloud.coveo.com/headless/v1.103/headless.js"></script>

  
  <!-- @coveo/atomic need to be included as a dependency -->
  <!-- Note the matching major and minor version as explained above -->
  <script crossorigin type="module" src="https://static.cloud.coveo.com/atomic/v1.108/atomic.esm.js"></script>
  
  <!--And then finally @coveo/atomic-react is included -->
  <!-- Note the matching major and minor version as explained above -->
  <script crossorigin src="https://static.cloud.coveo.com/atomic-react/v1.23/iife/atomic-react.min.js"></script>
</head>
```

Once this is done, you can now start using `CoveoAtomicReact` directly with an inline script tag: 

```html
<!DOCTYPE html>
<html>
  <head>
    [...]
  </head>
  <body>
    <div id="container"></div>
  </body>
  <script type="text/babel">
    'use strict';

    class SearchPage extends React.Component {
      constructor(props) {
        super(props);
        // Configure engine
        this.engine = CoveoAtomicReact.buildSearchEngine({...});
      }

      render() {
        return (
          <CoveoAtomicReact.AtomicSearchInterface engine={this.engine}>
            <CoveoAtomicReact.AtomicSearchBox></CoveoAtomicReact.AtomicSearchBox>
            <CoveoAtomicReact.AtomicResultList
              template={MyTemplateFunction}
            ></CoveoAtomicReact.AtomicResultList>
            [... etc ...]
          </CoveoAtomicReact.AtomicSearchInterface>
        );
      }
    }

    const domContainer = document.querySelector('#container');
    const root = ReactDOM.createRoot(domContainer);
    root.render(React.createElement(SearchPage));
  </script>
</html>


```
