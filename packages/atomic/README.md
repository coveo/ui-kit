[![npm version](https://badge.fury.io/js/@coveo%2Fatomic.svg)](https://badge.fury.io/js/@coveo%2Fatomic)
![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Atomic

A web-component library for building modern UIs interfacing with the Coveo platform. Atomic web-components are built with [Stencil](https://stenciljs.com/docs/introduction). They are self-encapsulated, composable, and light-weight.

Using the library: [Coveo Atomic Library Official Documentation](https://docs.coveo.com/en/atomic/latest/).

## Getting Started

Once you have cloned the repo, follow the instructions in the top-level [README.md](../../README.md) to install dependencies and link packages.

To start the project in development mode, run:

```bash
npm run dev
```

To build the library for production, run:

```bash
npm run build
```

To run the unit tests for the components, run:

```bash
npm test
```

## Run Cypress for Atomic components

Ref: https://docs.cypress.io/

- All the tests will need to be under folder cypress\integration

### Open

To open cypress, run:

```sh
npm run e2e:watch
```

To run all the test, run:

```sh
npm run e2e
```

To run all the test in Firefox:

```sh
npm run e2e:firefox
```

### Separate test for Hosted Search Page

To test the current Atomic build against the hosted search pages for Trials, use the following commands:

```sh
npm run e2e:hsp:watch
npm run e2e:hsp
npm run e2e:hsp:firefox
```

## Utilities

### Stencil decorators

When building Atomic components, a series of decorators are used to make development faster.

## InitializeBindings & BindStateToController decorators

`InitializeBindings` is a utility that automatically fetches the `bindings` from the parent `atomic-search-interface` or `atomic-external` component. This decorator has to be applied to a property named `bindings`.

_Important_ In order for a component using this decorator to render properly, it should have an internal state bound to one of the properties from `bindings`. This is possible by using the `BindStateToController` decorator along with a `State` decorator.

Here is a complete example:

```typescript
import {
  InitializeBindings,
  InitializableComponent,
  BindStateToController,
  Bindings,
} from '@coveo/atomic';
import {ControllerState, Controller, buildController} from '@coveo/headless';
import {Component, State} from '@stencil/core';

@Component({
  tag: 'atomic-component',
})
export class AtomicComponent implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private controller!: Controller;

  // Automatically subscribes the `controllerState` to the state of the `controller`
  @BindStateToController('controller')
  @State()
  private controllerState!: ControllerState;

  // Method called after bindings are defined, where controllers should be initialized
  public initialize() {
    this.controller = buildController(this.bindings.engine);
  }

  render() {
    return [this.strings.value(), this.controllerState.value];
  }
}
```

## ResultContext decorator

`ResultContext` is a utility that automatically fetches the `result` from the parent component's rendered `atomic-result`. This utility is used inside of custom result template components.

```typescript
import {ResultContext} from '@coveo/atomic';
import {Component, State} from '@stencil/core';

@Component({
  tag: 'atomic-result-component',
})
export class AtomicResultComponent {
  @ResultContext() private result!: Result;

  @State() public error!: Error;

  public render() {
    return this.result.title;
  }
}
```
