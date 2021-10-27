# Detailed Reporting

The Quantic package provides a custom Cypress reporter that can produce a detailed report, listing all the validated expectations.

## Running tests with detailed report

To use the detailed report, run:

```bash
npm run cypress:test:detailed
```

It invokes Cypress with the `--reporter cypress/reporters/detailed-reporter.js` argument to output the results using the custom reporter.

## Adding details to tests

In order to print the expectation detail, and additional context, you need to provide the information in the test.

To provide details regarding an expectation, you should use the `logDetail` custom Cypress command after the actual expectation is verified. This way, the reporter can list all expectations that passed. If one expectation fails, then the reporter will display the error message as usual.

```javascript
cy.get('#greeting')
  .should('contain', 'Hello')
  .logDetail('The greeting element should contain "Hello"');
```

The reporter will then output this line. The leading dot indicates an expectation.

```bash
  . The greeting element should contain "hello"
```

A single Cypress test validates many expectations and can contain a sequence of many actions. Printing lots of expectations for a single test can be confusing. The `scope` function allows to group expectations to put them into context. You can also nest calls to `scope` if needed.

The `scope` function is imported from [detailed-collector.ts](../cypress/reporters/detailed-collector.ts)

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

The reporter output would look like this.

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
