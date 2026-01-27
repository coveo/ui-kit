import type {UserAction as IUserAction} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {
  defaultBindings,
  renderInAtomicInsightInterface,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import type {AtomicInsightUserActionsSession} from './atomic-insight-user-actions-session';
import './atomic-insight-user-actions-session';

vi.mock('@/src/utils/date-utils', () => ({
  parseTimestampToDateDetails: vi.fn((timestamp: number) => {
    const date = new Date(timestamp);
    return {
      hours: date.getUTCHours(),
      minutes: date.getUTCMinutes(),
      year: date.getUTCFullYear(),
      month: date.toLocaleString('en', {month: 'short', timeZone: 'UTC'}),
      day: date.getUTCDate(),
      dayOfWeek: date.toLocaleString('en', {weekday: 'short', timeZone: 'UTC'}),
    };
  }),
}));

describe('atomic-insight-user-actions-session', () => {
  const mockUserActions: IUserAction[] = [
    {
      actionType: 'SEARCH' as IUserAction['actionType'],
      query: 'test query',
      timestamp: 1704067200000, // 2024-01-01 00:00:00
      searchHub: 'default',
    },
    {
      actionType: 'CLICK' as IUserAction['actionType'],
      timestamp: 1704067260000, // 2024-01-01 00:01:00
      searchHub: 'default',
      document: {
        title: 'Test Document',
        contentIdValue: 'http://example.com',
      },
    },
  ];

  const mockUserActionsWithCaseCreation: IUserAction[] = [
    {
      actionType: 'SEARCH' as IUserAction['actionType'],
      query: 'search before case',
      timestamp: 1704063600000,
      searchHub: 'default',
    },
    {
      actionType: 'CLICK' as IUserAction['actionType'],
      timestamp: 1704065400000,
      searchHub: 'default',
      document: {
        title: 'Document before case',
        contentIdValue: 'http://example.com/1',
      },
    },
    {
      actionType: 'TICKET_CREATION' as IUserAction['actionType'],
      timestamp: 1704067200000,
      searchHub: 'default',
    },
    {
      actionType: 'SEARCH' as IUserAction['actionType'],
      query: 'search after case',
      timestamp: 1704067800000,
      searchHub: 'default',
    },
  ];

  const renderComponent = async ({
    startTimestamp = 1704067200000,
    userActions = mockUserActions,
  }: {
    startTimestamp?: number;
    userActions?: IUserAction[];
  } = {}) => {
    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightUserActionsSession>({
        template: html`
          <atomic-insight-user-actions-session
            .startTimestamp=${startTimestamp}
            .userActions=${userActions}
          ></atomic-insight-user-actions-session>
        `,
        selector: 'atomic-insight-user-actions-session',
        bindings: defaultBindings,
      });

    return {
      element,
      showMoreButton: () =>
        element.shadowRoot?.querySelector(
          '[data-testid="show-more-actions-button"]'
        ),
      moreActionsSection: () =>
        element.shadowRoot?.querySelector(
          '[data-testid="more-actions-section"]'
        ),
      sessionStartIcon: () =>
        element.shadowRoot?.querySelector(
          '[part="session-start-icon__container"]'
        ),
      sessionStartDateContainer: () =>
        element.shadowRoot?.querySelector(
          '[data-testid="session-start-date-container"]'
        ),
      actions: () => element.shadowRoot?.querySelectorAll('ol li'),
    };
  };

  describe('when rendering a regular session', () => {
    it('should display search query text', async () => {
      const {element} = await renderComponent({
        userActions: [
          {
            actionType: 'SEARCH' as IUserAction['actionType'],
            query: 'my test query',
            timestamp: 1704067200000,
            searchHub: 'default',
          },
        ],
      });

      const text = element.shadowRoot?.textContent || '';
      expect(text).toContain('my test query');
    });

    it('should display document title', async () => {
      const {element} = await renderComponent({
        userActions: [
          {
            actionType: 'CLICK' as IUserAction['actionType'],
            timestamp: 1704067200000,
            searchHub: 'default',
            document: {
              title: 'Test Document Title',
              contentIdValue: 'http://example.com',
            },
          },
        ],
      });

      const text = element.shadowRoot?.textContent || '';
      expect(text).toContain('Test Document Title');
    });

    it('should display action timestamps', async () => {
      const {element} = await renderComponent({
        userActions: [
          {
            actionType: 'SEARCH' as IUserAction['actionType'],
            query: 'test',
            timestamp: 1704067260000, // 00:01:00 UTC
            searchHub: 'default',
          },
        ],
      });

      const text = element.shadowRoot?.textContent || '';

      expect(text).toMatch(/\d{2}:\d{2}/);
    });

    it('should display formatted session start date', async () => {
      const {sessionStartDateContainer} = await renderComponent({
        startTimestamp: 1704067200000, // 2024-01-01 00:00:00 UTC
      });

      const text = sessionStartDateContainer()?.textContent || '';

      expect(text).toMatch(/\w+\.\s+\w+\s+\d+,\s+\d{4}/);
      expect(text).toContain('2024');
      expect(text).toMatch(/Jan/i);
    });

    it('should not render flag icon when session has no case creation', async () => {
      const {sessionStartIcon} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(sessionStartIcon()).toBeNull();
    });

    it('should render all user actions when no case creation', async () => {
      const {actions} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(actions()?.length).toBe(2);
    });

    it('should not show more actions button when session has no actions before case creation', async () => {
      const {showMoreButton} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(showMoreButton()).toBeNull();
    });
  });

  describe('when rendering a case creation session', () => {
    it('should render flag icon when session has case creation', async () => {
      const {sessionStartIcon} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      expect(sessionStartIcon()).toBeInTheDocument();
    });

    it('should render only actions from case creation onwards', async () => {
      const {actions} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      expect(actions()?.length).toBe(2);
    });

    it('should show more actions button when session has actions before case creation', async () => {
      const {showMoreButton} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      expect(showMoreButton()).toBeInTheDocument();
    });

    it('should display correct count in show more button label', async () => {
      const {showMoreButton} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      const button = showMoreButton()?.querySelector('button');
      const ariaLabel = button?.getAttribute('aria-label') || '';

      expect(ariaLabel).toMatch(/2/);
      expect(button?.textContent).toContain('2');
    });

    it('should reveal actions and hide button after clicking show more', async () => {
      const {element, showMoreButton, moreActionsSection} =
        await renderComponent({
          userActions: mockUserActionsWithCaseCreation,
        });

      expect(moreActionsSection()).toBeNull();
      expect(showMoreButton()).toBeInTheDocument();

      const button = showMoreButton()?.querySelector('button');
      button?.click();
      await element.updateComplete;

      expect(moreActionsSection()).toBeInTheDocument();
      const revealedActions = moreActionsSection()?.querySelectorAll('li');
      expect(revealedActions?.length).toBe(2);
      expect(showMoreButton()).toBeNull();
    });
  });

  describe('when rendering with edge cases', () => {
    it('should render session start date when userActions is empty', async () => {
      const {sessionStartDateContainer, actions} = await renderComponent({
        userActions: [],
      });

      expect(sessionStartDateContainer()).toBeInTheDocument();
      expect(actions()?.length).toBe(0);
    });

    it('should not show button when only ticket creation exists', async () => {
      const {showMoreButton, actions} = await renderComponent({
        userActions: [
          {
            actionType: 'TICKET_CREATION' as IUserAction['actionType'],
            timestamp: 1704067200000,
            searchHub: 'default',
          },
        ],
      });

      expect(showMoreButton()).toBeNull();
      expect(actions()?.length).toBe(1);
    });

    it('should use first ticket creation when multiple exist', async () => {
      const {showMoreButton, actions} = await renderComponent({
        userActions: [
          {
            actionType: 'SEARCH' as IUserAction['actionType'],
            query: 'first',
            timestamp: 1,
            searchHub: 'default',
          },
          {
            actionType: 'TICKET_CREATION' as IUserAction['actionType'],
            timestamp: 2,
            searchHub: 'default',
          },
          {
            actionType: 'SEARCH' as IUserAction['actionType'],
            query: 'second',
            timestamp: 3,
            searchHub: 'default',
          },
          {
            actionType: 'TICKET_CREATION' as IUserAction['actionType'],
            timestamp: 4,
            searchHub: 'default',
          },
          {
            actionType: 'SEARCH' as IUserAction['actionType'],
            query: 'third',
            timestamp: 5,
            searchHub: 'default',
          },
        ],
      });

      const button = showMoreButton()?.querySelector('button');
      expect(button?.textContent).toContain('1');
      expect(actions()?.length).toBe(4);
    });
  });

  describe('when props change', () => {
    it('should update displayed actions', async () => {
      const {element, actions} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(actions()?.length).toBe(2);

      element.userActions = [mockUserActions[0]];
      await element.updateComplete;

      expect(actions()?.length).toBe(1);
    });

    it('should recalculate case creation session', async () => {
      const {element, showMoreButton} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(showMoreButton()).toBeNull();

      element.userActions = mockUserActionsWithCaseCreation;
      await element.updateComplete;

      expect(showMoreButton()).toBeInTheDocument();
    });

    it('should update displayed date when startTimestamp changes', async () => {
      const {element, sessionStartDateContainer} = await renderComponent({
        startTimestamp: 1704067200000, // Jan 1, 2024 UTC
      });

      const originalText = sessionStartDateContainer()?.textContent;
      expect(originalText).toContain('2024');

      element.startTimestamp = 1735689600000; // Jan 1, 2025 UTC
      await element.updateComplete;

      const newText = sessionStartDateContainer()?.textContent;
      expect(newText).not.toBe(originalText);
      expect(newText).toContain('2025');
    });
  });
});
