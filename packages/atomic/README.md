![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Atomic

A web-component library for building modern UIs interfacing with the Coveo platform. Atomic web-components are built with [Stencil](https://stenciljs.com/docs/introduction). They are self-encapsulated, composable, and light-weight.

## Getting Started

Once you have cloned the repo, follow the instructions in the top-level [README.md](https://bitbucket.org/coveord/ui-kit/src/master/README.md) to install dependencies and link packages.

To start the project in development mode, run:

```bash
npm start
```

To build the library for production, run:

```bash
npm run build
```

To run the unit tests for the components, run:

```bash
npm test
```

## Using the components

### Script tag

- Put a script tag similar to this `<script src='https://unpkg.com/my-component@0.0.1/dist/mycomponent.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### Initialization

- To initialize the `atomic-search-interface` component, you have to add a script tag calling `initialize(...)` on it once the custom element is defined:
```html
<script>
  (async () => {
    await customElements.whenDefined('atomic-search-interface');
    document.querySelector('atomic-search-interface').initialize({
      accessToken: 'my_token',
      organizationId: 'my_org',
    });
  })();
</script>
```
- All other components have to be the child of an initialized `atomic-search-interface` to work properly.
- For testing or demo purposes, adding the `sample` attribute on the `atomic-search-interface` element is sufficient and will bypass initialization.

### Node Modules

- Run `npm install @coveo/atomic --save`
- Put a script tag similar to this `<script src='node_modules/@coveo/atomic/dist/mycomponent.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### In your app

- Run `npm install @coveo/atomic --save`
- Add an import to the npm packages `import '@coveo/atomic';`
- Then you can use the element anywhere in your template, JSX, html etc

## Run Cypress for Atomic components

Ref: https://docs.cypress.io/

- All the tests will need to be under folder cypress\integration

### Open

To open cypress, run:

```sh
npm run cypressopen
```

To run all the test, run:

```sh
npm run cypresstest
```

## Utilities

### The InitializeBindings, BindStateToController & BindStateToI18n decorators

The `InitializeBindings` is an utility that automatically fetches the `bindings` from the parent `atomic-search-interface` component. This decorator should be applied to the `bindings` property directly.

*Important* In order for a component using this decorator to render properly, it should have an internal state bound to one of the property from `bindings`. This is possible by using either the `BindStateToController` or the `BindStateToI18n` decorator.

Here is a complete example using all these decorators:

```typescript
@Component({
  tag: 'atomic-component',
  shadow: false,
})
export class AtomicComponent {
  @InitializeBindings() public bindings!: Bindings;
  private controller!: Controller;
  
  // Will automatically subscribe the `controllerState` to state of the `controller`
  @BindStateToController('controller') 
  @State()
  private controllerState!: ControllerState;

  // Will automically update the strings on initialization and when the locale changes
  @BindStateToI18n()
  @State()
  private strings = {
    value: () => this.bindings.i18n.t('value', { /* options */ }),
  };

  // Method called after bindings are defined, where controllers should be initialized
  public initialize() {
    this.controller = buildController(this.bindings.engine);
  }

  render() {
    return [
      this.strings.value(),
      this.controllerState.value,
    ];
  }
}
```
