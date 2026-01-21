import {
  buildUserActions as buildInsightUserActions,
  type UserActionsState as InsightUserActionsState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeUserActions} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/user-actions-controller';
import type {AtomicInsightUserActionsTimeline} from './atomic-insight-user-actions-timeline';
import './atomic-insight-user-actions-timeline';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-user-actions-timeline', () => {
  const defaultUserActions = {
    timeline: {
      session: {
        start: 1723035731,
        actions: [
          {
            actionType: 'TICKET_CREATION' as const,
            timestamp: 1723035731000,
            query: 'test query',
            queryPipeline: 'pipeline',
          },
        ],
      },
      followingSessions: [
        {
          start: 1723036000,
          actions: [
            {
              actionType: 'SEARCH' as const,
              timestamp: 1723036000000,
              query: 'following query',
              queryPipeline: 'pipeline',
            },
          ],
        },
        {
          start: 1723036200,
          actions: [
            {
              actionType: 'CLICK' as const,
              timestamp: 1723036200000,
              documentUri: 'https://example.com',
              documentTitle: 'Example',
              queryPipeline: 'pipeline',
            },
          ],
        },
      ],
      precedingSessions: [
        {
          start: 1723035000,
          actions: [
            {
              actionType: 'SEARCH' as const,
              timestamp: 1723035000000,
              query: 'preceding query',
              queryPipeline: 'pipeline',
            },
          ],
        },
        {
          start: 1723034800,
          actions: [
            {
              actionType: 'VIEW' as const,
              timestamp: 1723034800000,
              documentUri: 'https://example.com/view',
              documentTitle: 'View Example',
              queryPipeline: 'pipeline',
            },
          ],
        },
      ],
    },
  };

  const renderComponent = async ({
    props = {},
    userActionsState = defaultUserActions,
  }: {
    props?: Partial<{
      userId: string;
      ticketCreationDateTime: string;
      excludedCustomActions: string[];
    }>;
    userActionsState?: Partial<InsightUserActionsState>;
  } = {}) => {
    vi.mocked(buildInsightUserActions).mockReturnValue(
      buildFakeUserActions(userActionsState)
    );

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightUserActionsTimeline>({
        template: html`
        <atomic-insight-user-actions-timeline
          user-id=${ifDefined(props.userId)}
          ticket-creation-date-time=${ifDefined(props.ticketCreationDateTime)}
          .excludedCustomActions=${props.excludedCustomActions || []}
        ></atomic-insight-user-actions-timeline>
      `,
        selector: 'atomic-insight-user-actions-timeline',
      });

    return {
      element,
      activeSession: page.locator('[data-testid="active-session"]'),
      followingSessions: page.locator('[data-testid="following-session"]'),
      precedingSessions: page.locator('[data-testid="preceding-session"]'),
      showFollowingSessionsButton: page.getByRole('button', {
        name: /show following sessions/i,
      }),
      hideFollowingSessionsButton: page.getByRole('button', {
        name: /hide following sessions/i,
      }),
      showPrecedingSessionsButton: page.getByRole('button', {
        name: /show preceding sessions/i,
      }),
      hidePrecedingSessionsButton: page.getByRole('button', {
        name: /hide preceding sessions/i,
      }),
      userActionsError: page.locator('[data-testid="user-actions-error"]'),
      parts: (el: AtomicInsightUserActionsTimeline) => ({
        toggleFollowingSessions: el.shadowRoot?.querySelector(
          '[part="toggle-following-sessions"]'
        ),
        toggleFollowingSessionsIcon: el.shadowRoot?.querySelector(
          '[part="toggle-following-sessions-icon"]'
        ),
        togglePrecedingSessions: el.shadowRoot?.querySelector(
          '[part="toggle-preceding-sessions"]'
        ),
        togglePrecedingSessionsIcon: el.shadowRoot?.querySelector(
          '[part="toggle-preceding-sessions-icon"]'
        ),
      }),
    };
  };

  describe('#initialize', () => {
    it('should build user actions controller with engine and options', async () => {
      const {element} = await renderComponent({
        props: {
          userId: 'user@example.com',
          ticketCreationDateTime: '2024-08-01T00:00:00Z',
          excludedCustomActions: ['custom1', 'custom2'],
        },
      });

      expect(buildInsightUserActions).toHaveBeenCalledWith(
        element.bindings.engine,
        {
          options: {
            ticketCreationDate: '2024-08-01T00:00:00Z',
            excludedCustomActions: ['custom1', 'custom2'],
          },
        }
      );
    });

    it('should fetch user actions with provided userId', async () => {
      const mockFetchUserActions = vi.fn();
      vi.mocked(buildInsightUserActions).mockReturnValue(
        buildFakeUserActions({
          ...defaultUserActions,
          fetchUserActions: mockFetchUserActions,
        } as unknown as Partial<InsightUserActionsState>)
      );

      await renderComponent({
        props: {
          userId: 'test-user@example.com',
          ticketCreationDateTime: '2024-08-01T00:00:00Z',
        },
      });

      expect(mockFetchUserActions).toHaveBeenCalledWith(
        'test-user@example.com'
      );
    });

    it('should bind state to controller', async () => {
      const {element} = await renderComponent({
        userActionsState: defaultUserActions,
      });

      expect(element.userActionsState.timeline).toBeDefined();
      expect(element.userActionsState.timeline?.session).toBeDefined();
    });
  });

  describe('when user actions are available', () => {
    beforeEach(async () => {
      await renderComponent({
        props: {
          userId: 'user@example.com',
          ticketCreationDateTime: '2024-08-01T00:00:00Z',
        },
      });
    });

    it('should display the active session', async ({activeSession}) => {
      await expect.element(activeSession).toBeInTheDocument();
    });

    it('should display the toggle following sessions button', async ({
      showFollowingSessionsButton,
    }) => {
      await expect.element(showFollowingSessionsButton).toBeInTheDocument();
    });

    it('should display the toggle preceding sessions button', async ({
      showPrecedingSessionsButton,
    }) => {
      await expect.element(showPrecedingSessionsButton).toBeInTheDocument();
    });

    it('should not display following sessions by default', async ({
      followingSessions,
    }) => {
      await expect.element(followingSessions).not.toBeInTheDocument();
    });

    it('should not display preceding sessions by default', async ({
      precedingSessions,
    }) => {
      await expect.element(precedingSessions).not.toBeInTheDocument();
    });

    it('should render all shadow parts', async () => {
      const {element, parts} = await renderComponent();

      expect(parts(element).toggleFollowingSessions).toBeDefined();
      expect(parts(element).toggleFollowingSessionsIcon).toBeDefined();
      expect(parts(element).togglePrecedingSessions).toBeDefined();
      expect(parts(element).togglePrecedingSessionsIcon).toBeDefined();
    });
  });

  describe('when toggling following sessions', () => {
    it('should show following sessions when clicking show button', async ({
      showFollowingSessionsButton,
      followingSessions,
    }) => {
      await renderComponent();

      await showFollowingSessionsButton.click();

      await expect.element(followingSessions).toHaveCount(2);
    });

    it('should hide following sessions when clicking hide button', async ({
      showFollowingSessionsButton,
      hideFollowingSessionsButton,
      followingSessions,
    }) => {
      await renderComponent();

      await showFollowingSessionsButton.click();
      await expect.element(hideFollowingSessionsButton).toBeInTheDocument();

      await hideFollowingSessionsButton.click();

      await expect.element(followingSessions).not.toBeInTheDocument();
    });

    it('should toggle button label when showing/hiding', async ({
      showFollowingSessionsButton,
      hideFollowingSessionsButton,
    }) => {
      await renderComponent();

      await expect.element(showFollowingSessionsButton).toBeInTheDocument();
      await showFollowingSessionsButton.click();

      await expect.element(hideFollowingSessionsButton).toBeInTheDocument();
      await hideFollowingSessionsButton.click();

      await expect.element(showFollowingSessionsButton).toBeInTheDocument();
    });
  });

  describe('when toggling preceding sessions', () => {
    it('should show preceding sessions when clicking show button', async ({
      showPrecedingSessionsButton,
      precedingSessions,
    }) => {
      await renderComponent();

      await showPrecedingSessionsButton.click();

      await expect.element(precedingSessions).toHaveCount(2);
    });

    it('should hide preceding sessions when clicking hide button', async ({
      showPrecedingSessionsButton,
      hidePrecedingSessionsButton,
      precedingSessions,
    }) => {
      await renderComponent();

      await showPrecedingSessionsButton.click();
      await expect.element(hidePrecedingSessionsButton).toBeInTheDocument();

      await hidePrecedingSessionsButton.click();

      await expect.element(precedingSessions).not.toBeInTheDocument();
    });

    it('should toggle button label when showing/hiding', async ({
      showPrecedingSessionsButton,
      hidePrecedingSessionsButton,
    }) => {
      await renderComponent();

      await expect.element(showPrecedingSessionsButton).toBeInTheDocument();
      await showPrecedingSessionsButton.click();

      await expect.element(hidePrecedingSessionsButton).toBeInTheDocument();
      await hidePrecedingSessionsButton.click();

      await expect.element(showPrecedingSessionsButton).toBeInTheDocument();
    });
  });

  describe('when no following sessions exist', () => {
    it('should not display toggle following sessions button', async ({
      showFollowingSessionsButton,
    }) => {
      await renderComponent({
        userActionsState: {
          timeline: {
            ...defaultUserActions.timeline,
            followingSessions: [],
          },
        },
      });

      await expect.element(showFollowingSessionsButton).not.toBeInTheDocument();
    });
  });

  describe('when no preceding sessions exist', () => {
    it('should not display toggle preceding sessions button', async ({
      showPrecedingSessionsButton,
    }) => {
      await renderComponent({
        userActionsState: {
          timeline: {
            ...defaultUserActions.timeline,
            precedingSessions: [],
          },
        },
      });

      await expect.element(showPrecedingSessionsButton).not.toBeInTheDocument();
    });
  });

  describe('when no user actions are available', () => {
    it('should display the error screen when timeline is undefined', async ({
      userActionsError,
    }) => {
      await renderComponent({
        userActionsState: {
          timeline: undefined,
        },
      });

      await expect.element(userActionsError).toBeInTheDocument();
    });

    it('should display the error screen when session is missing', async ({
      userActionsError,
    }) => {
      await renderComponent({
        userActionsState: {
          timeline: {
            session: undefined,
            followingSessions: [],
            precedingSessions: [],
          },
        },
      });

      await expect.element(userActionsError).toBeInTheDocument();
    });
  });

  describe('when an error occurs', () => {
    it('should display the error screen when error state is set', async ({
      userActionsError,
    }) => {
      await renderComponent({
        userActionsState: {
          ...defaultUserActions,
          error: {
            message: 'Access denied',
            statusCode: 403,
            type: 'ACCESS_DENIED',
          } as unknown as undefined,
        },
      });

      await expect.element(userActionsError).toBeInTheDocument();
    });
  });

  describe('property attributes', () => {
    it('should accept userId with kebab-case attribute', async () => {
      const {element} = await renderComponent({
        props: {
          userId: 'test@example.com',
          ticketCreationDateTime: '2024-08-01T00:00:00Z',
        },
      });

      expect(element.userId).toBe('test@example.com');
    });

    it('should accept ticketCreationDateTime with kebab-case attribute', async () => {
      const {element} = await renderComponent({
        props: {
          userId: 'test@example.com',
          ticketCreationDateTime: '2024-08-01T00:00:00Z',
        },
      });

      expect(element.ticketCreationDateTime).toBe('2024-08-01T00:00:00Z');
    });

    it('should accept excludedCustomActions array', async () => {
      const {element} = await renderComponent({
        props: {
          userId: 'test@example.com',
          ticketCreationDateTime: '2024-08-01T00:00:00Z',
          excludedCustomActions: ['action1', 'action2'],
        },
      });

      expect(element.excludedCustomActions).toEqual(['action1', 'action2']);
    });
  });
});
