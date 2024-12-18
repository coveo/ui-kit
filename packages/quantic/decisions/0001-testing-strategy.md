# Decision Record: Testing Strategy for Quantic

- **Date**: 2024-11-06
- **Status**: accepted

## Context

Our project involves testing Lightning Web Components (LWCs) to ensure quality and reliability. We have decided to use Jest for unit testing to verify component logic and isolated behavior and Playwright for end-to-end (E2E) testing to validate user interactions and integration within the full UI. This document outlines the criteria for deciding what should be tested in each environment.

## Decision

We have established the following guidelines for Jest and Playwright testing in LWCs:

### Jest Unit Tests

Jest will focus on isolated component behavior, covering specific scenarios without involving the browser environment or real user workflows.

Key points for Jest unit tests:

- **Isolated Component Behavior**: Tests should verify the component's behavior in isolation, without dependency on external systems or other components.
- **Mock External Dependencies**: Use mocks to simulate external dependencies, such as capabilities used from the Headless library, ensuring unit tests are fast and isolated.
- **HTML Rendering**: Validate that the component renders the correct HTML based on its state (including but not limited to: internal state, mocked headless state) and input properties.
- **Property Updates**: Ensure component properties update as expected in response to user interactions and lifecycle events.
- **Edge Cases**: Cover edge cases to ensure the component handles unexpected or extreme inputs gracefully.

**Example Jest Test Scenarios**:

- Mock a Headless controller call to test a specific component in isolation.
- Mock a Headless state and ensure the component renders correctly by reflecting the state in the UI.
- Verify that clicking a button updates a specific property, that the rendered HTML reflects this change and the corresponding Headless component controller was called correctly and with the correct parameters.
- Test a lifecycle event, such as `connectedCallback`, to confirm it initializes the component correctly.

### Playwright E2E Tests

Playwright E2E tests will simulate actual user actions to validate the functionality of LWCs within the full user interface and ensure interaction with external systems.

Key points for Playwright E2E tests:

- **User Workflow Testing**: Focus on the essential paths users take to accomplish their goals with a given component, this for all the different Quantic use cases: Search, Insight, Case assist and Recomendations.
- **Simulate User Actions**: Test realistic user actions, such as clicking buttons, entering data, and navigating through the UI.
- **External System Interactions**: Verify interactions with external systems, like Coveo APIs and analytics, to ensure components behave as expected in a real-world environment. This also acts as a double test because it will also notify us by failing the test if the external API contract is broken too because we test for the expected request body but also the expected response as much as possible.
- **Browser-specific behaviors**: Test browser-specific behaviors that would interact with our components.

**Example Playwright Test Scenarios**:

- A user uses a Quantic component by interacting with its multiple buttons and triggering Coveo analytics. We test that the expected analytics are sent, that the events are valid, and the response from the analytics API are correct.
- A user navigates through a whole search workflow, interacting with multiple components. We test the expected Search API calls and responses, the analytics calls and response, and also the reactivity of the full search experience.
- Verify the integration between the Quantic components and Salesforce. We test that modifying data through the Salesforce components has an impact and triggers the correct components reactions in a Quantic experience.
- A user modifies the URL parameters. We assess the impact on our components.
- The browser viewport size changes. We verify that our components adapt their display accordingly.

## Alternatives Considered

1. **Relying Solely on E2E with Cypress for All Testing**:
   - This was used before and is now rejected because using only E2E tests would slow down feedback cycles and increase test maintenance due to the complexity of mocking and setting up end-to-end environments for every component interaction.

## Consequences

- This approach balances efficient, reliable test coverage with manageable test maintenance. Jest allows us to cover specific logic and UI rendering in a lightweight manner, while Playwright provides confidence that the application works as expected for end-users.
- By clearly separating Jest and Playwright responsibilities, we prevent redundancy and maintain test suite performance.
- We are also taking the approach of relying more on the tests already done upstream in Headless for example where each component controller is already tested too, we choose not to re-test that once you trigger a Headless action correctly, we trust that it will have the correct result on the state so we don't need to re-test all of that with e2e tests.
