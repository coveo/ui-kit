// @ts-ignore
import quanticUserActionsSession from 'c/quanticUserActionsSession';
// @ts-ignore
import {createElement} from 'lwc';

const selectors = {
  sessionDateIcon: '[data-test="session-start__date-icon"]',
  sessionDate: '[data-test="session-start__date"]',
  showMoreActions: '[data-test="session__show-more-actions-button"]',
  userActions: '[data-test="session__user-actions"] c-quantic-user-action',
  userActionsAferTicketCreation:
    '[data-test="session__user-actions-after-ticket-creation"] c-quantic-user-action',
};

function createTestComponent(options) {
  const element = createElement('c-quantic-user-actions-session', {
    is: quanticUserActionsSession,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('c-quantic-user-actions-session', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  afterEach(() => {
    cleanup();
  });

  describe('when the user action session does not contain a ticket creation action', () => {
    const exampleActions = [
      {
        actionType: 'SEARCH',
        timestamp: new Date('2024-09-25T05:08Z').getTime(),
        query: 'example query',
      },
      {
        actionType: 'SEARCH',
        timestamp: new Date('2024-09-25T05:07Z').getTime(),
        query: 'example query',
      },
    ];

    describe('the session start date', () => {
      it('should display the session start date without the icon', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        const sessionDateIcon = element.shadowRoot.querySelector(
          selectors.sessionDateIcon
        );
        const sessionDate = element.shadowRoot.querySelector(
          selectors.sessionDate
        );

        expect(sessionDateIcon).toBeNull();
        expect(sessionDate).not.toBeNull();

        expect(sessionDate.textContent).toBe('Wed. September 25, 2024');
      });
    });

    describe('the show more actions button', () => {
      it('should not show the show more actions button', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        const showMoreActions = element.shadowRoot.querySelector(
          selectors.showMoreActions
        );

        expect(showMoreActions).toBeNull();
      });
    });

    describe('the session user actions', () => {
      it('should properly display the user actions', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        const userActions = element.shadowRoot.querySelectorAll(
          selectors.userActions
        );

        expect(userActions.length).toBe(exampleActions.length);
        for (let index = 0; index < exampleActions.length; index++) {
          expect(userActions[index].action).toEqual(exampleActions[index]);
        }
      });
    });
  });

  describe('when the user action session contains a ticket creation action', () => {
    const exampleActions = [
      {
        actionType: 'SEARCH',
        timestamp: new Date('2024-09-25T05:09Z').getTime(),
        query: 'example query',
      },
      {
        actionType: 'TICKET_CREATION',
        timestamp: new Date('2024-09-25T05:08Z').getTime(),
      },
      {
        actionType: 'SEARCH',
        timestamp: new Date('2024-09-25T05:07Z').getTime(),
        query: 'example query',
      },
    ];
    const numberOfActionsAfterTicketCreation = 1;

    describe('the session start date', () => {
      it('should display the session start date with the icon', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        const sessionDateIcon = element.shadowRoot.querySelector(
          selectors.sessionDateIcon
        );
        const sessionDate = element.shadowRoot.querySelector(
          selectors.sessionDate
        );

        expect(sessionDateIcon).not.toBeNull();
        expect(sessionDate).not.toBeNull();

        expect(sessionDate.textContent).toBe('Wed. September 25, 2024');
      });
    });

    describe('the session user actions', () => {
      it('should display the user actions that occurred before the ticket creation', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        const userActions = element.shadowRoot.querySelectorAll(
          selectors.userActions
        );

        expect(userActions.length).toBe(
          exampleActions.length - numberOfActionsAfterTicketCreation
        );
        for (
          let index = numberOfActionsAfterTicketCreation;
          index < exampleActions.length;
          index++
        ) {
          expect(userActions[index - 1].action).toEqual(exampleActions[index]);
        }
      });

      it('should not display the user actions that occurred after the ticket creation', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        const userActions = element.shadowRoot.querySelectorAll(
          selectors.userActionsAferTicketCreation
        );

        expect(userActions.length).toBe(0);
      });

      describe('after clicking the show more actions button', () => {
        it('should display the user actions that occurred after the ticket creation', async () => {
          const element = createTestComponent({
            userActions: exampleActions,
            startTimestamp: new Date('2024-09-25T05:07Z'),
          });
          await flushPromises();

          const showMoreActions = element.shadowRoot.querySelector(
            selectors.showMoreActions
          );

          showMoreActions.click();
          await flushPromises();

          const userActionsAferTicketCreation =
            element.shadowRoot.querySelectorAll(
              selectors.userActionsAferTicketCreation
            );

          expect(userActionsAferTicketCreation.length).toBe(
            numberOfActionsAfterTicketCreation
          );
          for (
            let index = 0;
            index < numberOfActionsAfterTicketCreation;
            index++
          ) {
            expect(userActionsAferTicketCreation[index].action).toEqual(
              exampleActions[index]
            );
          }
        });
      });
    });

    describe('the show more actions button', () => {
      it('should display the show more actions button', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        const showMoreActions = element.shadowRoot.querySelector(
          selectors.showMoreActions
        );

        expect(showMoreActions).not.toBeNull();
      });

      it('should hide the show more actions button after clicking on it', async () => {
        const element = createTestComponent({
          userActions: exampleActions,
          startTimestamp: new Date('2024-09-25T05:07Z'),
        });
        await flushPromises();

        let showMoreActions = element.shadowRoot.querySelector(
          selectors.showMoreActions
        );

        showMoreActions.click();
        await flushPromises();

        showMoreActions = element.shadowRoot.querySelector(
          selectors.showMoreActions
        );
        expect(showMoreActions).toBeNull();
      });
    });
  });
});
