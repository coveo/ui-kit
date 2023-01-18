/* eslint-disable jest/no-conditional-expect */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticUserActionSession from '../quanticUserActionSession';

const selectors = {
  title: '.session-title lightning-formatted-date-time',
  startTime: '.slds-popover__body lightning-formatted-date-time:nth-child(1)',
  endTime: '.slds-popover__body lightning-formatted-date-time:nth-child(2)',
  userActionEvent: 'c-quantic-user-action-event',
  moreActionsButton: '.session_more-actions-button',
};

const exampleEngineId = 'example EngineId';
const exampleStartDate = 1672768867000;
const exampleEndDate = 1672778845000;
const exampleActionsAfterCaseCreation = [
  {
    actionType: 'search',
    document: {
      title: 'Action One',
      clickUri: 'https://example.com',
    },
    searchHub: 'One',
    timestamp: '1',
  },
  {
    actionType: 'click',
    document: {
      title: 'Action Two',
      clickUri: 'https://example.com',
    },
    searchHub: 'Two',
    timestamp: '2',
  },
];
const exampleActionsBeforeCaseCreation = [
  {
    actionType: 'case-creation',
    document: {
      title: 'Action Three',
      clickUri: 'https://example.com',
    },
    searchHub: 'Three',
    timestamp: '3',
  },
  {
    actionType: 'click',
    document: {
      title: 'Action Four',
      clickUri: 'https://example.com',
    },
    searchHub: 'Four',
    timestamp: '4',
  },
  {
    actionType: 'view',
    document: {
      title: 'Action Five',
      clickUri: 'https://example.com',
    },
    searchHub: 'Five',
    timestamp: '5',
  },
];
const exampleActions = [
  ...exampleActionsAfterCaseCreation,
  ...exampleActionsBeforeCaseCreation,
];

const defaultOptions = {
  engineId: exampleEngineId,
  startDate: exampleStartDate,
  endDate: exampleEndDate,
  isActiveSession: false,
  actions: exampleActions,
};

jest.mock(
  '@salesforce/label/c.quantic_MoreActionsInSession',
  () => ({default: '1 more action in this session'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_MoreActionsInSession_plural',
  () => ({
    default: `${exampleActionsAfterCaseCreation.length} more actions in this session`,
  }),
  {
    virtual: true,
  }
);

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-user-action-session', {
    is: QuanticUserActionSession,
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

describe('c-quantic-user-action-session', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }

  afterEach(() => {
    cleanup();
  });

  describe('when the property #isActiveSession is set to false', () => {
    it('should properly display the session title', async () => {
      const element = createTestComponent();
      await flushPromises();

      const title = element.shadowRoot.querySelector(selectors.title);
      const tooltipStartTime = element.shadowRoot.querySelector(
        selectors.startTime
      );
      const tooltipEndTime = element.shadowRoot.querySelector(
        selectors.endTime
      );

      expect(title.value).toBe(exampleStartDate);
      expect(tooltipStartTime.value).toBe(exampleStartDate);
      expect(tooltipEndTime.value).toBe(exampleEndDate);
    });

    it('should properly display all the user actions', async () => {
      const element = createTestComponent();
      await flushPromises();

      const userActionEvents = element.shadowRoot.querySelectorAll(
        selectors.userActionEvent
      );
      const moreActionsButton = element.shadowRoot.querySelector(
        selectors.moreActionsButton
      );

      userActionEvents.forEach((userActionEvent, index) => {
        expect(userActionEvent.action).toEqual(defaultOptions.actions[index]);
        expect(userActionEvent.engineId).toBe(defaultOptions.engineId);
      });

      expect(moreActionsButton).toBeNull();
    });
  });

  describe('when the property #isActiveSession is set to true', () => {
    it('should properly display the session title', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        isActiveSession: true,
      });
      await flushPromises();

      const title = element.shadowRoot.querySelector(selectors.title);
      const tooltipStartTime = element.shadowRoot.querySelector(
        selectors.startTime
      );
      const tooltipEndTime = element.shadowRoot.querySelector(
        selectors.endTime
      );

      expect(title.value).toBe(exampleStartDate);
      expect(tooltipStartTime.value).toBe(exampleStartDate);
      expect(tooltipEndTime.value).toBe(exampleEndDate);
    });

    it('should properly display all the user actions that took place before the case was created', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        isActiveSession: true,
      });
      await flushPromises();

      const userActionEvents = element.shadowRoot.querySelectorAll(
        selectors.userActionEvent
      );
      const moreActionsButton = element.shadowRoot.querySelector(
        selectors.moreActionsButton
      );
      expect(moreActionsButton).not.toBeNull();
      expect(moreActionsButton.label).toBe(
        `${exampleActionsAfterCaseCreation.length} more actions in this session`
      );
      userActionEvents.forEach((userActionEvent, index) => {
        if (
          exampleActionsBeforeCaseCreation[index].actionType === 'case-creation'
        ) {
          expect(userActionEvent.action).toEqual({
            ...exampleActionsBeforeCaseCreation[index],
            actionType: 'active-case-creation',
          });
        } else {
          expect(userActionEvent.action).toEqual(
            exampleActionsBeforeCaseCreation[index]
          );
        }
        expect(userActionEvent.engineId).toBe(defaultOptions.engineId);
      });
    });

    describe('when the "Show more actions" button is clicked', () => {
      it('should properly display all the user actions that took place before and after the case was created.', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          isActiveSession: true,
        });
        await flushPromises();

        let moreActionsButton = element.shadowRoot.querySelector(
          selectors.moreActionsButton
        );

        expect(moreActionsButton).not.toBeNull();
        await moreActionsButton.click();
        moreActionsButton = element.shadowRoot.querySelector(
          selectors.moreActionsButton
        );
        expect(moreActionsButton).toBeNull();

        const userActionEvents = element.shadowRoot.querySelectorAll(
          selectors.userActionEvent
        );

        userActionEvents.forEach((userActionEvent, index) => {
          if (defaultOptions.actions[index].actionType === 'case-creation') {
            expect(userActionEvent.action).toEqual({
              ...defaultOptions.actions[index],
              actionType: 'active-case-creation',
            });
          } else {
            expect(userActionEvent.action).toEqual(
              defaultOptions.actions[index]
            );
          }
          expect(userActionEvent.engineId).toBe(defaultOptions.engineId);
        });
      });
    });

    describe('when no user action has taken place after the case was created', () => {
      it('should not display the "Show more actions" button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          isActiveSession: true,
          actions: exampleActionsBeforeCaseCreation,
        });
        await flushPromises();

        let moreActionsButton = element.shadowRoot.querySelector(
          selectors.moreActionsButton
        );

        expect(moreActionsButton).toBeNull();
      });
    });

    describe('when only one user action has taken place after the case was created', () => {
      it('should display the correct label of the "Show more actions" button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          isActiveSession: true,
          actions: [
            ...exampleActionsAfterCaseCreation.slice(1),
            ...exampleActionsBeforeCaseCreation,
          ],
        });
        await flushPromises();

        let moreActionsButton = element.shadowRoot.querySelector(
          selectors.moreActionsButton
        );

        expect(moreActionsButton).not.toBeNull();
        expect(moreActionsButton.label).toBe('1 more action in this session');
      });
    });
  });
});
