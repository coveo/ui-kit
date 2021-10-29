# Detailed reporting

The Quantic package provides a custom Cypress reporter that can produce a detailed report, listing all the validated expectations.

## Running tests with detailed reports

To use the detailed report, run:

```bash
npm run cypress:test:detailed
```

This command invokes Cypress with the `--reporter cypress/reporters/detailed-reporter.js` argument to output the results using the custom reporter.

## Adding details to tests

In order to print the expectation details, and additional context, you must provide the information in the test.

To provide expectation details, we recommend using the `logDetail` custom Cypress command after the actual expectation is verified. This way, the reporter can list all the expectations that passed. If an expectation fails, an error message will be displayed.

For example, if you enter:

```javascript
cy.get('#greeting')
  .should('contain', 'Hello')
  .logDetail('The greeting element should contain "Hello"');
```

The reporter will output the following line. The leading dot indicates an expectation.

```bash
  . The greeting element should contain "hello"
```

A single Cypress test validates many expectations and can contain a sequence of many actions. Printing several expectations for a single test can be confusing. The `scope` function allows you to group expectations and put them in context. If necessary, you can also nest calls using the `scope` function.

The `scope` function is imported from [detailed-collector.ts](../cypress/reporters/detailed-collector.ts).

For example, if you enter:

```javascript
describe('example', () => {
  it('should render properly', () => {
    cy.visit('example-page');

    scope('page structure', () => {
      scope('header', () => {
        cy.get('#header')
          .should('be.visible')
          .logDetail('The header should be visible')
          .find('#greeting')
          .should('contain', 'Hello')
          .logDetail('The greeting element contains "Hello"');
      });

      scope('footer', () => {
        cy.get('#footer')
          .should('be.visible')
          .logDetail('The footer should be visible');
      });
    });
  });
});
```

The reporter will output the following:

```bash
example
  ✓ should render properly
    page structure
      header
        . The header should be visible
        . The greeting element contains "Hello"
      footer
        . The footer should be visible
```
