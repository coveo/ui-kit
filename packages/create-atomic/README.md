# @coveo/create-atomic

The `@coveo/create-atomic` package contains the necessary components to set up a search page using [Coveo Atomic](https://docs.coveo.com/atomic), which is built upon [Coveo Headless](https://docs.coveo.com/headless).

If you want to create a new Coveo Headless-powered search page with the Coveo Atomic web framework from scratch, it is simpler to use the [`coveo ui:create:atomic` command in the Coveo CLI](../cli/README.md#coveo-uicreateatomic-name). The Coveo CLI will handle a lot of complexity for you.

## Installation

We recommend using the [`coveo ui:create:atomic` command in the Coveo CLI](../cli/README.md#coveo-uicreateatomic-name), but to use the project directly, you can also run:

```
npm init @coveo/atomic myapp
```

or

```
npx @coveo/create-atomic myapp
```

or

```
npm install -g @coveo/create-atomic
create-atomic myapp
```

If you run the project directly, you will be prompted to fill out your organization's authentication information.
