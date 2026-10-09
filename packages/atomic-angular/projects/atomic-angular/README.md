[![npm version](https://badge.fury.io/js/@coveo%2Fatomic-angular.svg)](https://badge.fury.io/js/@coveo%2Fatomic-angular)

# Atomic Angular

An Angular component library for building search and commerce UIs on the Coveo platform. It wraps the [Atomic](https://docs.coveo.com/en/atomic/latest/) web components as Angular components, so you can use them in Angular templates with typed inputs and methods.

Most of what the Atomic documentation says also applies to Atomic Angular. This page covers what is specific to Angular. For the full guide, see [Use the Angular wrapper](https://docs.coveo.com/en/atomic/latest/usage/frameworks/atomic-angular-wrapper/).

## Start from a template

To start a new project, scaffold one of the Angular templates:

```sh
npm create @coveo/ui@latest my-app -- --template atomic-search-angular
```

Use `atomic-commerce-angular` for a commerce project. For the other options, see [Create a Coveo search interface project](https://docs.coveo.com/en/q8qh2338).

## Installation

```sh
npm install @coveo/atomic-angular @coveo/headless
```

`@coveo/headless` is a peer dependency. Import Headless symbols, such as `buildSearchEngine` or the `Result` type, from `@coveo/headless`: `@coveo/atomic-angular` doesn't re-export them.

The Angular versions this package supports are the `@angular/core` range in its peer dependencies:

```sh
npm view @coveo/atomic-angular peerDependencies
```

`@coveo/atomic-angular` depends on an exact version of `@coveo/atomic`. If your package manager doesn't hoist dependencies (pnpm, for example), and you reference `@coveo/atomic` files or entry points yourself (the theme, or [elements outside Angular templates](#atomic-elements-outside-angular-templates)), add `@coveo/atomic` as a direct dependency at that same version, so only one copy is installed:

```sh
npm view @coveo/atomic-angular@<version> dependencies
```

## Import AtomicAngularModule

`AtomicAngularModule` declares an Angular component for every Atomic element. Import it in each standalone component that uses Atomic elements:

```typescript
import {Component} from '@angular/core';
import {AtomicAngularModule} from '@coveo/atomic-angular';

@Component({
  selector: 'app-search-page',
  imports: [AtomicAngularModule],
  templateUrl: './search-page.html',
})
export class SearchPage {}
```

In an `NgModule`-based app, add it to the `imports` of the module that declares those components instead.

In a production build, only the Atomic elements used in your templates are bundled and registered.

## Initialize the search interface

Get the `atomic-search-interface` component with a view query, then initialize it once the view exists, for example in `ngAfterViewInit`:

```typescript
import {type AfterViewInit, Component, viewChild} from '@angular/core';
import {AtomicAngularModule, AtomicSearchInterface} from '@coveo/atomic-angular';
import {buildSearchEngine} from '@coveo/headless';

const engine = buildSearchEngine({
  configuration: {
    organizationId: '<ORGANIZATION_ID>',
    accessToken: '<ACCESS_TOKEN>',
  },
});

@Component({
  selector: 'app-search-page',
  imports: [AtomicAngularModule],
  templateUrl: './search-page.html',
})
export class SearchPage implements AfterViewInit {
  private readonly searchInterface = viewChild.required(AtomicSearchInterface);

  async ngAfterViewInit() {
    const searchInterface = this.searchInterface();
    await searchInterface.initializeWithSearchEngine(engine);
    await searchInterface.executeFirstSearch();
  }
}
```

```html
<!-- search-page.html -->
<atomic-search-interface>
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box></atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-query-summary></atomic-query-summary>
      </atomic-layout-section>
      <atomic-layout-section section="results">
        <atomic-result-list></atomic-result-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>
```

If you don't need your own engine, call `initialize({organizationId, accessToken})` instead of `initializeWithSearchEngine`. For commerce, use `AtomicCommerceInterface` with an engine from `@coveo/headless/commerce`, and call `initializeWithEngine` and `executeFirstRequest`.

## Static assets: languages and icons

Atomic loads its translations and SVG icons at runtime, so they aren't part of your bundle. Without them, labels show as placeholder keys and icons are missing. This package ships them in its `assets` and `lang` folders. Serve them from your app with the `assets` option in `angular.json`:

```json
"assets": [
  {"glob": "**/*", "input": "public"},
  {"glob": "**/*", "input": "node_modules/@coveo/atomic-angular/assets", "output": "assets"},
  {"glob": "**/*", "input": "node_modules/@coveo/atomic-angular/lang", "output": "lang"}
]
```

By default, Atomic looks for them in `./lang` and `./assets`, relative to the document's base URL. If you serve them elsewhere, set the `language-assets-path` and `icon-assets-path` attributes on the interface component.

See [Workspace configuration](https://angular.dev/reference/configs/workspace-config) for the `assets` option.

## Theme

To use the default Coveo theme, add it to the `styles` option in `angular.json`:

```json
"styles": ["node_modules/@coveo/atomic/dist/themes/coveo.css", "src/styles.css"]
```

The theme is optional. You can set [theme variables](https://docs.coveo.com/en/atomic/latest/usage/themes-and-visual-customization/) in your global stylesheet instead, or in addition.

## Inputs, methods and events

Each wrapper component exposes the Atomic element's properties as Angular inputs, and its methods as component methods. Bind inputs like any Angular input. Arrays and objects are passed to the element as they are:

```html
<atomic-facet
  field="source"
  [label]="facetLabel()"
  [allowedValues]="['Docs', 'Blog']"
></atomic-facet>
```

So, to build your own component on top of Atomic elements, declare Angular inputs and bind them to the Atomic elements in its template:

```typescript
import {Component, input} from '@angular/core';
import {AtomicAngularModule} from '@coveo/atomic-angular';

@Component({
  selector: 'app-field-label',
  imports: [AtomicAngularModule],
  template: `<atomic-text [value]="label()"></atomic-text>`,
})
export class FieldLabel {
  readonly label = input('');
}
```

Listen to Atomic events with a template event binding on the event name listed in the component's reference documentation, such as `(redirect)="onRedirect($event)"` on a standalone `atomic-search-box`.

## Result templates and the initial render

Don't render template components such as `atomic-result-template` as part of your root component's initial view. That includes the root component's own template and any component it renders directly. In that view, Angular connects each element to the document before it appends the element's children. So `atomic-result-template` looks for its `<template>` child before that child exists, fails with `The "atomic-result-template" component must contain a "template" element as a child`, and no results render.

Render the search page in a view that Angular builds before inserting it, such as a routed component or a component inside an `@if` block.

## Change detection: zoneless and OnPush

Atomic Angular works in zoneless apps, which are the default since Angular 21, with no extra configuration.

In a zoneless app, and in components that use `OnPush` change detection (the default since Angular 22), Angular doesn't refresh the view when code it doesn't control updates a plain class field. This includes Headless controller subscriptions, `addEventListener` callbacks and observable subscriptions. Store such values in [signals](https://angular.dev/guide/signals):

```typescript
import {type AfterViewInit, Component, signal, viewChild} from '@angular/core';
import {AtomicAngularModule, AtomicSearchInterface} from '@coveo/atomic-angular';
import {buildQuerySummary} from '@coveo/headless';
import {engine} from './engine';

@Component({
  selector: 'app-search-page',
  imports: [AtomicAngularModule],
  template: `
    <p>{{ total() }} results</p>
    <atomic-search-interface><!-- ... --></atomic-search-interface>
  `,
})
export class SearchPage implements AfterViewInit {
  private readonly searchInterface = viewChild.required(AtomicSearchInterface);
  protected readonly total = signal(0);

  async ngAfterViewInit() {
    const querySummary = buildQuerySummary(engine);
    querySummary.subscribe(() => this.total.set(querySummary.state.total));

    await this.searchInterface().initializeWithSearchEngine(engine);
    await this.searchInterface().executeFirstSearch();
  }
}
```

Template event bindings already schedule change detection. See [Angular without ZoneJS](https://angular.dev/guide/zoneless).

## Atomic elements outside Angular templates

Importing `@coveo/atomic-angular` doesn't register every Atomic element: each wrapper component registers its own element, along with the elements it renders. An Atomic tag that doesn't appear in an Angular template, such as one inserted through `innerHTML` or created with `document.createElement`, is therefore not upgraded unless something else registers it.

To use such a tag, import its class from its `@coveo/atomic` entry point and register it, for example in the component that inserts the markup:

```typescript
import {AtomicResultBadge} from '@coveo/atomic/components/atomic-result-badge';

customElements.get('atomic-result-badge') ??
  customElements.define('atomic-result-badge', AtomicResultBadge);
```

The call is what keeps the class in your bundle. A bare `import '@coveo/atomic/components/atomic-result-badge';`, or an exported reference that nothing uses, registers nothing once bundled, because bundlers remove imports whose exports are unused.

## Documentation

- [Use the Angular wrapper](https://docs.coveo.com/en/atomic/latest/usage/frameworks/atomic-angular-wrapper/)
- [Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
- [Atomic localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/)
- [Themes and visual customization](https://docs.coveo.com/en/atomic/latest/usage/themes-and-visual-customization/)
