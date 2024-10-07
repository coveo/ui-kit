/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticUserActionsTimeline from 'c/quanticUserActionsTimeline';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
// @ts-ignore
import exampleUserActionsState from './data/userActionsState.json';

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_ShowFollowingSessions',
  () => ({default: 'Show following sessions'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_HideFollowingSessions',
  () => ({default: 'Hide following sessions'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_ShowPrecedingSessions',
  () => ({default: 'Show preceding sessions'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_HidePrecedingSessions',
  () => ({default: 'Hide preceding sessions'}),
  {
    virtual: true,
  }
);

const exampleTicketCreationDateTime = '2024-01-01T00:00:00Z';
const exampleExcludedCustomActions = ['dummyEvent'];
const exampleUserId = 'someone@company.com';
const exampleEngine = {
  id: 'dummy engine',
};

let userActionsState = {...exampleUserActionsState};
let isInitialized = false;

const functionsMocks = {
  buildUserActions: jest.fn(() => ({
    state: userActionsState,
    fetchUserActions: functionsMocks.fetchUserActions,
    subscribe: functionsMocks.subscribe,
  })),
  fetchUserActions: jest.fn(() => {}),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
};

const selectors = {
  noUserActionsScreen: '[data-test="timeline__no-user-actions-screen"]',
  followingSessionsSection:
    '[data-test="timeline__following-sessions-section"]',
  toggleFollowingSessionsButton:
    '[data-test="timeline__toggle-following-sessions-button"]',
  followingSessions:
    '[data-test="timeline__following-sessions-section"] c-quantic-user-actions-session',
  precedingSessionsSection:
    '[data-test="timeline__preceding-sessions-section"]',
  togglePrecedingSessionsButton:
    '[data-test="timeline__toggle-preceding-sessions-button"]',
  precedingSessions:
    '[data-test="timeline__preceding-sessions-section"] c-quantic-user-actions-session',
  ticketCreationSession: '[data-testid="ticket-creation-session"]',
  initializationError: 'c-quantic-component-error',
};

const defaultOptions = {
  engineId: 'exampleEngineId',
  ticketCreationDateTime: exampleTicketCreationDateTime,
  excludedCustomActions: exampleExcludedCustomActions,
  userId: exampleUserId,
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-user-actions-timeline', {
    is: QuanticUserActionsTimeline,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildUserActions: functionsMocks.buildUserActions,
    };
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticUserActionsTimeline && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticUserActionsTimeline) {
      element.setInitializationError();
    }
  };
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
  isInitialized = false;
}

describe('c-quantic-user-actions-timeline', () => {
  beforeAll(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
    userActionsState = {...exampleUserActionsState};
  });

  describe('when an error occurs', () => {
    beforeEach(() => {
      userActionsState = {...exampleUserActionsState, error: 'Error'};
    });

    it('should display the no user actions screen', async () => {
      const element = createTestComponent();
      await flushPromises();

      const noUserActionsScreen = element.shadowRoot.querySelector(
        selectors.noUserActionsScreen
      );

      expect(noUserActionsScreen).not.toBeNull();
    });
  });

  describe('when no user actions are found', () => {
    beforeEach(() => {
      userActionsState = {...exampleUserActionsState, timeline: null};
    });

    it('should display the no user actions screen', async () => {
      const element = createTestComponent();
      await flushPromises();

      const noUserActionsScreen = element.shadowRoot.querySelector(
        selectors.noUserActionsScreen
      );

      expect(noUserActionsScreen).not.toBeNull();
    });
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    afterAll(() => {
      mockSuccessfulHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.initializationError
      );

      expect(initializationError).not.toBeNull();
    });
  });

  describe('controller initialization', () => {
    it('should build the controller with the right parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildUserActions).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildUserActions).toHaveBeenCalledWith(
        exampleEngine,
        {
          options: {
            ticketCreationDate: exampleTicketCreationDateTime,
            excludedCustomActions: exampleExcludedCustomActions,
          },
        }
      );
    });

    it('should call fetchUserActions with the right parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.fetchUserActions).toHaveBeenCalledTimes(1);
      expect(functionsMocks.fetchUserActions).toHaveBeenCalledWith(
        exampleUserId
      );
    });

    it('should subscribe to state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user actions data is found', () => {
    describe('the following sessions section', () => {
      describe('when following sessions are found', () => {
        it('should display the following sessions section', async () => {
          const element = createTestComponent();
          await flushPromises();

          const followingSessionsSection = element.shadowRoot.querySelector(
            selectors.followingSessionsSection
          );

          expect(followingSessionsSection).not.toBeNull();
        });

        it('should display the show following sessions button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const toggleFollowingSessionsButton =
            element.shadowRoot.querySelector(
              selectors.toggleFollowingSessionsButton
            );

          expect(toggleFollowingSessionsButton).not.toBeNull();
          expect(toggleFollowingSessionsButton.label).toBe(
            'Show following sessions'
          );
        });

        it('should not display the following sessions', async () => {
          const element = createTestComponent();
          await flushPromises();

          const followingSessions = element.shadowRoot.querySelectorAll(
            selectors.followingSessions
          );

          expect(followingSessions.length).toBe(0);
        });

        describe('toggling on and off the following sessions', () => {
          it('should display and hide the following sessions when toggling on and off the show following sessions button', async () => {
            const element = createTestComponent();
            await flushPromises();

            const toggleFollowingSessionsButton =
              element.shadowRoot.querySelector(
                selectors.toggleFollowingSessionsButton
              );
            let followingSessions = element.shadowRoot.querySelectorAll(
              selectors.followingSessions
            );

            expect(toggleFollowingSessionsButton).not.toBeNull();
            expect(toggleFollowingSessionsButton.label).toBe(
              'Show following sessions'
            );
            expect(toggleFollowingSessionsButton.iconName).toBe(
              'utility:arrowup'
            );
            expect(followingSessions.length).toBe(0);

            await toggleFollowingSessionsButton.click();
            followingSessions = element.shadowRoot.querySelectorAll(
              selectors.followingSessions
            );

            expect(toggleFollowingSessionsButton.label).toBe(
              'Hide following sessions'
            );
            expect(toggleFollowingSessionsButton.iconName).toBe(
              'utility:arrowdown'
            );
            expect(followingSessions.length).toBe(
              userActionsState.timeline.followingSessions.length
            );
            followingSessions.forEach((sessionElement, index) => {
              const session =
                userActionsState.timeline.followingSessions[index];
              expect(sessionElement.startTimestamp).toBe(session.start);
              expect(sessionElement.userActions).toEqual(session.actions);
            });

            await toggleFollowingSessionsButton.click();
            followingSessions = element.shadowRoot.querySelectorAll(
              selectors.followingSessions
            );

            expect(toggleFollowingSessionsButton.label).toBe(
              'Show following sessions'
            );
            expect(toggleFollowingSessionsButton.iconName).toBe(
              'utility:arrowup'
            );
            expect(followingSessions.length).toBe(0);
          });
        });
      });

      describe('when following sessions are not found', () => {
        beforeEach(() => {
          userActionsState = {
            ...exampleUserActionsState,
            timeline: {
              ...exampleUserActionsState.timeline,
              followingSessions: [],
            },
          };
        });

        it('should not display the following sessions section', async () => {
          const element = createTestComponent();
          await flushPromises();

          const followingSessionsSection = element.shadowRoot.querySelector(
            selectors.followingSessionsSection
          );

          expect(followingSessionsSection).toBeNull();
        });
      });
    });

    describe('the ticket creation session', () => {
      it('should display the ticket creation session', async () => {
        const element = createTestComponent();
        await flushPromises();

        const ticketCreationSessionElement = element.shadowRoot.querySelector(
          selectors.ticketCreationSession
        );

        const expectedSession = userActionsState.timeline.session;
        expect(ticketCreationSessionElement).not.toBeNull();
        expect(ticketCreationSessionElement.startTimestamp).toBe(
          expectedSession.start
        );
        expect(ticketCreationSessionElement.userActions).toEqual(
          expectedSession.actions
        );
      });
    });

    describe('the preceding sessions section', () => {
      describe('when preceding sessions are found', () => {
        it('should display the preceding sessions section', async () => {
          const element = createTestComponent();
          await flushPromises();

          const precedingSessionsSection = element.shadowRoot.querySelector(
            selectors.precedingSessionsSection
          );

          expect(precedingSessionsSection).not.toBeNull();
        });

        it('should display the show preceding sessions button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const togglePrecedingSessionsButton =
            element.shadowRoot.querySelector(
              selectors.togglePrecedingSessionsButton
            );

          expect(togglePrecedingSessionsButton).not.toBeNull();
          expect(togglePrecedingSessionsButton.label).toBe(
            'Show preceding sessions'
          );
        });

        it('should not display the preceding sessions', async () => {
          const element = createTestComponent();
          await flushPromises();

          const precedingSessions = element.shadowRoot.querySelectorAll(
            selectors.precedingSessions
          );

          expect(precedingSessions.length).toBe(0);
        });

        describe('toggling on and off the preceding sessions', () => {
          it('should display and hide the preceding sessions when toggling on and off the show preceding sessions button', async () => {
            const element = createTestComponent();
            await flushPromises();

            const togglePrecedingSessionsButton =
              element.shadowRoot.querySelector(
                selectors.togglePrecedingSessionsButton
              );
            let precedingSessions = element.shadowRoot.querySelectorAll(
              selectors.precedingSessions
            );

            expect(togglePrecedingSessionsButton).not.toBeNull();
            expect(togglePrecedingSessionsButton.label).toBe(
              'Show preceding sessions'
            );
            expect(togglePrecedingSessionsButton.iconName).toBe(
              'utility:arrowdown'
            );
            expect(precedingSessions.length).toBe(0);

            await togglePrecedingSessionsButton.click();
            precedingSessions = element.shadowRoot.querySelectorAll(
              selectors.precedingSessions
            );

            expect(togglePrecedingSessionsButton.label).toBe(
              'Hide preceding sessions'
            );
            expect(togglePrecedingSessionsButton.iconName).toBe(
              'utility:arrowup'
            );
            expect(precedingSessions.length).toBe(
              userActionsState.timeline.precedingSessions.length
            );
            precedingSessions.forEach((sessionElement, index) => {
              const session =
                userActionsState.timeline.precedingSessions[index];
              expect(sessionElement.startTimestamp).toBe(session.start);
              expect(sessionElement.userActions).toEqual(session.actions);
            });

            await togglePrecedingSessionsButton.click();
            precedingSessions = element.shadowRoot.querySelectorAll(
              selectors.precedingSessions
            );

            expect(togglePrecedingSessionsButton.label).toBe(
              'Show preceding sessions'
            );
            expect(togglePrecedingSessionsButton.iconName).toBe(
              'utility:arrowdown'
            );
            expect(precedingSessions.length).toBe(0);
          });
        });
      });

      describe('when preceding sessions are not found', () => {
        beforeEach(() => {
          userActionsState = {
            ...exampleUserActionsState,
            timeline: {
              ...exampleUserActionsState.timeline,
              precedingSessions: [],
            },
          };
        });

        it('should not display the preceding sessions section', async () => {
          const element = createTestComponent();
          await flushPromises();

          const precedingSessionsSection = element.shadowRoot.querySelector(
            selectors.precedingSessionsSection
          );

          expect(precedingSessionsSection).toBeNull();
        });
      });
    });
  });
});
