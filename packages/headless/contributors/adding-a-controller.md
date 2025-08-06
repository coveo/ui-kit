# Contribution guide: Adding a new controller.

Controllers are the building blocks of Headless, that make it easy to build visual components on top of, by exposing relevant methods and state. Headless provides controllers to power search boxes, result lists, facets, pagers and many more UI components.

## Checklist

Building a new controller typically involves the following steps:

1. Create a design document describing the new controller's api. Consider the options the controller should accept, and the methods and state it should expose. Once ready, share the document with teammates for feedback.

2. Implement the controller under the `src/controllers/` directory.

3. Split the implementation process in multiple smaller code review instead of just one big diff. It's okay to have partial/incomplete implementation merged in main, as long as nothing is exported or documented publicly.

4. JSDoc is mandatory for all public symbols that will be interacted with by users of the library: This means new actions, options, interface, controller, functions, etc. Private symbols that are not exported do not require any documentation. Please include someone from the documentation team to help the review process.

5. Unit tests are mandatory, but can be added at a later stage of the development process, when the implementation is nearing the end and the new feature is more complete and solid.

6. When the feature is ready to be released, you will need to export the newly created feature in various index.ts files, depending on what you have created. For example, a new controller for the search use-case would need to be exported in `src/controllers/index.ts`. This will make it usable/importable by end users of the library. If there are any newly created actions, they will also need to be exported through the concept of an "action loader". For an example of this concept, look at `src/features/pagination/pagination-actions-loader`. This is mandatory and any action not exported in this manner (and only usable through a controller) should be considered a bug.

7. Create code samples for the controller inside of the `samples` package in the UI-KIT repository. Code samples should be code reviewed. These samples are picked up automatically by various documentation tools, and will appear as code sample usage on docs.coveo.com/headless.

8. Tell the documentation tools how to extract the controller reference documentation and code samples by adding a new entry to the relevant configuration(s) under `headless/doc-parser/use-cases`. These entries will configure documentation tools so that all reference and samples appear on docs.coveo.com/headless.

9. Think about possibly writing a new dedicated "handwritten" article about the feature and its usage, if you judge that an end user of the library would need more context to understand the usage. For example, if a controller requires special configuration in Coveo admin console, or if it needs special interaction with the end user application, such an article might help them self serve and troubleshoot better. If a handwritten article is appropriate, write a google doc and share it with the documentation team. They will be able to help you publish it on docs.coveo.com/headless.

10. You are done! You can now consider planning adding support for the new feature in one of our UI component libraries (Atomic, Quantic).
