# Atomic Angular

An Angular component library for building modern UIs interfacing with the Coveo platform. Atomic Angular is a wrapper around the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web component library.

The integration of Angular-based projects with Web based components can be tricky. This project is meant to address this issue, making it possible to use Atomic web-components in a manner that feels more natural to developers familiar with Angular.

## Installation

`npm i @coveo/atomic-angular`

## Usage

Since Atomic React is built on top of the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web-components library, the vast majority of concepts that apply to core Atomic will apply to Atomic Angular.

However, there are still some special considerations.

## Static Assets - Languages and SVGs

For performance reasons, the generated JavaScript bundle does not automatically include static assets that are loaded on demand. This impacts language support, as well as the use of included SVG icons.

It is mandatory that you make available external assets distributed with Atomic Angular by including them in the public directory of your app. Without this, for example, labels in the app will appear as temporary placeholders.

The location of the public directory depends on how you build, configure and distribute your app.

For example, for any project created with [Angular CLI](https://angular.io/cli), this would mean copying language and icon assets to the root of the source directory

```
cp -r node_modules/@coveo/atomic-angular/assets src/assets src/assets
cp -r node_modules/@coveo/atomic-angular/lang src/lang
```

It is important to respect the folder hierarchy, with SVG icons under the `assets` subdirectory, and labels and languages under the `lang` subdirectory.

## Wrapping Atomic Angular components

It can be a powerful technique to be able to wrap the out of the box components provided by Atomic Angular with application specific component.

It can be helpful to combine multiple Atomic Angular component into a higher level parent component, which can then be reused repetitively throughout an application.

The standard `@Input()` angular decorator cannot be used directly to pass down properties to Atomic web components in a component template.

We need to create a `getter` and `setter` which will then properly assign properties to the DOM, without the standard Angular rendering engine.

For example, let's see how we could wrap `atomic-text` inside a parent component, which would pass down props.

First, we need to create the parent component (`app-field-label`)

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

In the above example, we can see that we need to annotate `get label()` and `set label()` with the `@Input()` angular decorator.

When the label is set in the app component (`app.component.html`), we arrange for it to be passed down and propagated to `<atomic-text>` using `atomicText.el.setAttribute`. This ensure that that web component will properly receive the property without any modification of the property by the Angular rendering engine.

The reference to `atomicText` is then obtained with the `ViewChild('atomictext')` decorator.
`atomictext` is the reference set in the HTML template (`<atomic-text #atomictext></atomic-text>`).

Since that reference will only exists on `ngAfterViewInit`, we need to code defensively against undefined reference.

The property change is then executed inside a special `runOutsideAngular()` function to make sure that Angular does not needlessly recompute property changes, and trigger rendering lifecyle, as this is not needed.

The above example also does not apply if you are simply trying to pass down "native" DOM properties, such as `id`, `class`, etc. For these properties, the standard Angular methodology can be used.
