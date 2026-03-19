---
title: Home
slug: index
---
# Use the Headless library

_Coveo Headless_ is a library for developing Coveo-powered UI components.
It works as a middle layer for applications, opening a line of communication between the UI elements and the [Coveo Platform](https://docs.coveo.com/en/186/).

For example, the [Coveo Atomic](https://docs.coveo.com/en/atomic/latest/) library relies on Headless to handle interactions between the application state and Coveo. Platform.

> [!NOTE]
> Coveo also provide a version of the Headless Library for use with React Projects. 
> See the [Headless-React reference documentation](https://docs.coveo.com/en/headless-react/latest/reference/index.html).

At its core, Headless consists of an _engine_ whose main property is its _state_ (that is, a [Redux store](https://redux.js.org/api/store)).
The engine’s state depends on a set of _features_ (that is, [reducers](https://redux.js.org/basics/reducers)).
To interact with these features, Headless provides a collection of _controllers_.

For example, to implement a search box UI component, you would use the Headless search box controller.
This exposes various methods, such as `updateText`, `submit`, and `showSuggestion`.

Under the hood, Headless relies on different Coveo APIs depending on your solution:

* For sending analytics data, Headless uses the Coveo Event API.
* For non-commerce solutions, Headless interacts with the Coveo Platform using the Coveo Search API.

  For Coveo for Commerce solutions, Headless interacts with the Coveo Platform using the Coveo Commerce API.
  For more details, see the documentation on the [commerce engine](https://docs.coveo.com/en/o52e9091/).

![Diagram showing where Headless fits with Atomic and the APIs](https://docs.coveo.com/en/assets/images/headless/headless.svg)

## When Should I Use Headless?

The Headless library wraps the complexity of the Coveo APIs without sacrificing flexibility.
It’s usable with any web development framework and it manages the state of your search page for you.
Rather than prebuilt UI components, it provides an extendable set of reducers and controllers that allow you to connect your own search UI components to the Coveo APIs.

If you want to use Coveo to power your own UI component library, then you should definitely consider using Headless.
It’s the easiest and least error-prone approach to developing and maintaining your Coveo-powered UI component library.

The following interactive code sample uses Coveo Headless alongside the [Material-UI React framework](https://material-ui.com/) to create a simple search page.

<iframe src="https://stackblitz.com/github/coveo/headless-documentation-material-ui-react-codesandbox/tree/version-3.35.0/?embed=1&view=split&file=src%2FApp.tsx"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="coveo-headless-demo-v3.35.0"
     allow=""
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<dl><dt><strong>💡 TIP: Leading practice</strong></dt><dd>

Unless you need full control over the appearance of your page, Headless is most likely not for you.
Rather, to quickly assemble a feature-rich search interface, consider using Coveo Atomic, our prebuilt, modern component library.
</dd></dl>

Additionally, in rare cases you may need to develop directly against the Coveo APIs, such as when you want to integrate Coveo search features inside a non-web-based application.

## Where Do I Start?

To learn the basics of the Headless library, see the [Usage](https://docs.coveo.com/en/headless/latest/usage) and [Reference](https://docs.coveo.com/en/headless/latest/reference) sections.

To create a starter Angular, React, or Vue.js project with a Coveo Headless-powered search page, check out the [Coveo CLI](https://github.com/coveo/cli#readme).