# Contributing

Relay is managed by the Coveo Data Platform unit, but we welcome contributions. As with any Coveo code repository, (preferably unit) tests for contributed code are mandatory.

## Install and build

Relay uses [pnpm](https://pnpm.io) as a package manager, see its [installation instructions](https://pnpm.io/installation) for installing pnpm. Run `pnpm install` to install dependencies. Run `pnpm build` to generate built packages. Relay requires a node.js version of 20 and higher.

## Tests

Tests are implemented using [jest](https://jestjs.io). Run `pnpm test` to run unit tests.

## Javascript coding guidelines

Relay is written in modern typescript with an eye on functional programming, rather than object oriented programming. In practice, this means thinking about your code as consisting of immutable data "objects" processed by "functions" which carry no side effects (e.g. [pure functions](https://en.wikipedia.org/wiki/Pure_function))

### Classes and interfaces

As a guideline, it helps to think of classes as being in one of these two cases:

1. (Immutable) data objects: In JavaScript these are typically json structures. Rather than forcing them to be classes and modeling them out explicitly, they can be encapsulated using an equivalent interface definition, which significantly simplifies code and readability.
2. Processing logic: These should be implemented by pure functions, not by class methods. Processing methods that could be considered similar can be defined together in a single file.

In general, we prefer loose interface types for data objects over class declarations. Interface definitions allow different implementations and can be implemented with simple objects on the fly. Interfaces are not transpiled into javascript, which results in more compact packages. The canonical class definition for an immutable data object will look like

```
interface WidgetObject {
    <definition>
}

export function createWidgetObject(args) : Readonly<WidgetObject> {
    return {
        ... // constructor logic
    }
}
```

If you find yourself declaring classes which mix data storage with stateful logic of which you will need multiple instances, you are falling back on an object-oriented design patterns and may want to reconsider your design.

### Destructuring patterns on function arguments

Use destructuring patterns with care, and where appropriate. Destructuring is useful when your function has many parameters (some of which are effectively acting as config switches):

Rather than

```
function write(value:number, overwrite: boolean, immediate: boolean) {...}

write(6, true, false)
```

we prefer the more readable

```

interface FunctionOptions { overwrite: boolean, immediate: boolean };
function write(value:number, options: FunctionOptions) {...};

write(6, {overwrite: true, immediate: false})
```

Overuse of destructuring patterns leads to function argument types being defined away from the function itself, which hampers readability. As there is a small object creation overhead involved with destructuring patterns, take care with functions that are called a lot. As a general guideline:

- If your function requires more than 3 basic types (e.g. boolean or string) consider a destructuring pattern.
- If your function has a subset of parameters that act as "logic" switches in the function, consider a destructuring pattern.
- Don't use destructuring when your function only uses typed Data objects. Here, the typename will guide the user to the meaning of the parameter and the destructuring just adds overhead.
- Don't use destructuring on functions that receive large call volume.
