[![npm version](https://badge.fury.io/js/@coveo%2Fatomic.svg)](https://badge.fury.io/js/@coveo%2Fatomic)
![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Atomic

A web-component library for building modern UIs interfacing with the Coveo platform. Atomic web-components are built with [Stencil](https://stenciljs.com/docs/introduction). They are self-encapsulated, composable, and light-weight.

Using the library: [Coveo Atomic Library Official Documentation](https://docs.coveo.com/en/atomic/latest/).

## Entry points

The `@coveo/atomic` package exposes the following entry points:

- `@coveo/atomic`: exports various types and utilities used by Coveo Atomic.
- `@coveo/atomic/loader`: exports the Coveo Atomic components types, as well as the `defineCustomElements` and `setNonce` utilities.
- `@coveo/atomic/themes`: exports the sample Coveo Atomic themes.
- `@coveo/atomic/assets`: exports the SVG icons used by Coveo Atomic.
- `@coveo/atomic/lang`: exports the localization files used by Coveo Atomic.

## Getting Started

Once you have cloned the repo, follow the instructions in the top-level [README.md](../../README.md) to install dependencies and link packages.

### Running package scripts
While there are package specific scripts for this package, its best to rely on running command with `turbo` from the root of the monorepo.

For example, to run the package in the development you would run 

```sh
# ✅ Preferred method
pnpm turbo run dev --filter=@coveo/atomic
```

from the root of the monorepo, as opposed to 

```sh
# ❌ Deprecated method
cd package/atomic
pnpm run dev 
```

While running scripts from the package folder does work, using the `turbo` scripts is generally a smoother experience.

All the subsequent examples assume you are operating from the monorepo root.


### Available scripts


Atomic uses Storybook for component development, documentation, and testing. To start Storybook in development mode:

```sh
pnpm turbo run dev --filter=@coveo/atomic
```

Storybook will be available at `http://localhost:4400`.

> [!NOTE]
> It is important you build `@coveo/atomic` at least once before running the Storybook server.
> This ensures all components can be properly rendered by Storybook, otherwise you not see components rendered.

To build the library for production, run:

```sh
pnpm turbo run build --filter=@coveo/atomic
```

To run the unit tests for the components, run:

```sh
pnpm turbo run test --filter=@coveo/atomic
```



### Storybook MCP (Model Context Protocol)

This Storybook instance is configured with the MCP addon, which enables AI agents to programmatically interact with component stories. When Storybook is running, the MCP server is accessible at `http://localhost:4400/mcp`.

## Run Cypress for Atomic components

Ref: https://docs.cypress.io/

- All the tests will need to be under folder cypress\integration

### Open

To open cypress, run:

```sh
pnpm turbo run e2e:watch --filter=@coveo/atomic
```

To run all the test, run:

```sh
pnpm turbo run e2e  --filter=@coveo/atomic
```

To run all the test in Firefox:

```sh
pnpm turbo run e2e:firefox --filter=@coveo/atomic
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

## Generate Component Command

To generate a new component, use the following command:

```sh
pnpm turbo generate-component --filter=@coveo/atomic -- --name=<component-name> --output=<path-to-output-directory>
```

The `output` argument is optional. If not provided, it will default to `src/components/commerce`.

For example, to generate a component named `atomic-ball`, run:

```sh
pnpm turbo generate-component --filter=@coveo/atomic -- --name=ball
```

This will create the necessary component files under the default path `src/components/commerce/atomic-ball`.

If you'd like to specify a different path, you can use the `--output` flag. For example, to generate the component under `src/components/search`, run:

```sh
pnpm turbo generate-component --filter=@coveo/atomic -- --name=ball --output=src/components/search
```

You can also use `--name=atomic-ball` if you'd like, but the script will automatically add the "atomic" prefix if necessary.

This will create the component in the specified directory (`src/components/search/atomic-ball` in this case), or use the default `src/components/commerce/atomic-ball` if no `output` is provided.
