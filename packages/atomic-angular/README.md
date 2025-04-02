[![npm version](https://badge.fury.io/js/@coveo%2Fatomic-angular.svg)](https://badge.fury.io/js/@coveo%2Fatomic-angular)

# Atomic Angular

An Angular component library for building modern UIs interfacing with the Coveo platform. Atomic Angular is a wrapper around the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web component library.

The integration of Angular-based projects with Web based components can be tricky. This project is meant to address this issue, making it possible to use Atomic web-components in a manner that feels more natural to developers familiar with Angular.

## Installation

`npm i @coveo/atomic-angular`

## Usage

Since Atomic Angular is built on top of the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web-components library, the vast majority of concepts that apply to core Atomic will apply to Atomic Angular.

However, there are still some special considerations.

## Importing AtomicAngularModule

In the module where you wish to make available Atomic Angular components, you must declare and import the `AtomicAngular` module.

For example:

```typescript
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AtomicAngularModule} from '@coveo/atomic-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AtomicAngularModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Once this is done, you will be able to reference all atomic components inside that module.

## Initializing the Search Interface

You can initialize the search interface at any time in the lifecycle of your application. One such suitable lifecycle hook is `AfterViewInit`.

The following example uses this `AfterViewInit` hook, and relies on the above `AppModule` as a starting point, which bootstraps `AppComponent`.

```typescript
// app.component.ts
import {AfterViewInit, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const searchInterface = document.querySelector('atomic-search-interface');
    searchInterface
      ?.initialize({
        accessToken: '<REPLACE_WITH_TOKEN>',
        organizationId: '<REPLACE_WITH_COVEO_ORGANIZATION_ID>',
      })
      .then(() => {
        searchInterface.executeFirstSearch();
      });
  }
}
```

```html
<!-- app.component.html  -->
<atomic-search-interface>
  <!-- content of the interface -->
</atomic-search-interface>
```

## Static Assets - Languages and SVGs

For performance reasons, the generated JavaScript bundle does not automatically include static assets that are loaded on demand. This impacts language support, as well as the use of included SVG icons.

It is mandatory that you make available external assets distributed with Atomic Angular by including them in the public directory of your app. Without this, for example, labels in the app will appear as temporary placeholders.

The location of the public directory depends on how you build, configure and distribute your app.

For example, for any project created with [Angular CLI](https://angular.io/cli), this would mean copying language and icon assets to the root of the source directory

```
cp -r node_modules/@coveo/atomic-angular/assets src/assets
cp -r node_modules/@coveo/atomic-angular/lang src/lang
```

It is important to respect the folder hierarchy, with SVG icons under the `assets` subdirectory, and labels and languages under the `lang` subdirectory.

Once this is done, these folders must be configured as asset folders in the application.

You can do so using the `angular.json` configuration file.

```json
"build": {
  // [...] omitted for brevity
  "options": {
    "assets": ["src/favicon.ico", "src/assets", "src/lang"],
  },
},
```

## Including the Default Coveo Theme

To include the default Coveo theme, use the `angular.json` configuration file.

```json
"build": {
   // [...] omitted for brevity
  "options": {
    "styles": [
      "./node_modules/@coveo/atomic/dist/atomic/themes/coveo.css",
      "src/styles.css"
    ],
  },
},
```

This is however optional, and (all theme variables)[https://docs.coveo.com/en/atomic/latest/usage/themes-and-visual-customization/#theme-variables] can be configured in the global application stylesheet (`src/style.css`, for example).

## Wrapping Atomic Angular Components

We recommend creating application-specific components which wrap out of the box Atomic Angular components. In other words, combine multiple Atomic Angular component into a higher level parent component, which you can then reuse throughout your application.

When doing so, you cannot use the standard `@Input()` angular decorator directly to pass down properties to Atomic web components in a component template. You need to create getter and setter functions that properly assign properties to the DOM, without the standard Angular rendering engine.

The following example wraps an `atomic-text` component inside a parent `app-field-label` component, which would pass down props.

```typescript
// field-label.component.ts

@Component({
  selector: 'app-field-label',
  templateUrl: './field-label.component.html',
})
export class FieldLabelComponent implements AfterViewInit {
  @ViewChild('atomictext') atomicText?: AtomicText;

  constructor(private z: NgZone) {}

  private val = '';
  @Input()
  get label(): string {
    if (this.atomicText) {
      this.val = this.atomicTextValueAttribute;
    }
    return this.val;
  }
  set label(v: string) {
    this.val = v;
    this.atomicTextValueAttribute = this.val;
  }

  ngAfterViewInit(): void {
    this.atomicTextValueAttribute = this.val;
  }

  private get atomicTextValueAttribute() {
    if (!this.atomicText) {
      return '';
    }
    return this.atomicText['el'].getAttribute('value') as string;
  }

  private set atomicTextValueAttribute(v: string) {
    if (!this.atomicText) {
      return;
    }
    this.z.runOutsideAngular(() => {
      this.atomicText!['el'].setAttribute('value', v);
    });
  }
}
```

```html
<!-- field-label.component.html -->
<atomic-text #atomictext></atomic-text>
```

```html
<!-- Example usage in app.component.html -->

<app-field-label label="My label"> </app-field-label>
```

In `field-label.component.ts`, notice that we annotate `get label()` and `set label()` with the `@Input()` angular decorator.

In `app.component.html`, when we set the label in the app component, we arrange for it to be passed down and propagated to `<atomic-text>` using `atomicText!['el'].setAttribute` in `field-label.component.ts`. This ensures that this web component will properly receive the property without any modification by the Angular rendering engine.

The reference to `atomicText` is then obtained with the `ViewChild('atomictext')` decorator.
`atomictext` is the reference set in the `<atomic-text #atomictext></atomic-text>` HTML template.

Since that reference will only exist on `ngAfterViewInit`, we code defensively against undefined references.

The property change is then executed inside a special `runOutsideAngular()` function to make sure that Angular does not needlessly recompute property changes and trigger the rendering lifecycle, as this is not needed.

The above example also does not apply if you are simply trying to pass down "native" DOM properties, such as `id`, `class`, etc. For these properties, you can use the standard Angular methodology.
