# Adding a controller

Controllers are the building blocks of Headless, that make it easy to build visual components on top of, by exposing relevant methods and state. Headless provides controllers to power search boxes, result lists, facets, pagers and many more UI components.


## Checklist

Building a new controller typically involves the following steps:

1. Create a design document describing the new controller's api. Consider the options the controller should accept, and the methods and state it should expose. Once ready, share the document with teammates for feedback.
2. Implement the controller under the `src/controllers/` directory.
3. Create code samples for the controller inside the `headless-react` project under the `src/components` directory.
4. Tell the doc-parser how to extract the controller reference documentation and code samples by adding a new entry to the relevant configuration(s) under `headless/doc-parser/use-cases`.
