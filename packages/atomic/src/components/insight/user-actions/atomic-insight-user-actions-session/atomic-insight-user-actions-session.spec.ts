import type {UserAction as IUserAction} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import {
  defaultBindings,
  renderInAtomicInsightInterface,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import type {AtomicInsightUserActionsSession} from './atomic-insight-user-actions-session';
import './atomic-insight-user-actions-session';

describe('atomic-insight-user-actions-session', () => {
  const mockUserActions: IUserAction[] = [
    {
      actionType: 'SEARCH',
      query: 'test query',
      timestamp: 1704067200000, // 2024-01-01 00:00:00
      searchHub: 'default',
    },
    {
      actionType: 'CLICK',
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
      actionType: 'SEARCH',
      query: 'search before case',
      timestamp: 1704063600000,
      searchHub: 'default',
    },
    {
      actionType: 'CLICK',
      timestamp: 1704065400000,
      searchHub: 'default',
      document: {
        title: 'Document before case',
        contentIdValue: 'http://example.com/1',
      },
    },
    {
      actionType: 'TICKET_CREATION',
      timestamp: 1704067200000,
      searchHub: 'default',
    },
    {
      actionType: 'SEARCH',
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
      actions: () => element.shadowRoot?.querySelectorAll('ol li'),
    };
  };

  describe('when rendering session start date', () => {
    it('should display formatted session start date', async () => {
      const {element} = await renderComponent({
        startTimestamp: 1704067200000, // 2024-01-01 00:00:00 UTC
      });

      const container = element.shadowRoot?.querySelector(
        '.flex.items-center.px-2.pb-3'
      );
      expect(container).toBeInTheDocument();
      expect(container?.textContent).toContain('2024');
    });

    it('should render flag icon when session has case creation', async () => {
      const {sessionStartIcon} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      expect(sessionStartIcon()).toBeInTheDocument();
    });

    it('should not render flag icon when session has no case creation', async () => {
      const {sessionStartIcon} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(sessionStartIcon()).toBeNull();
    });
  });

  describe('when rendering user actions', () => {
    it('should render all user actions when no case creation', async () => {
      const {actions} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(actions()?.length).toBe(2);
    });

    it('should render user actions after case creation first', async () => {
      const {element} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      // Should only show actions from case creation onwards
      const actions = element.shadowRoot?.querySelectorAll('ol li');
      expect(actions?.length).toBe(2); // Case creation + search after
    });

    it('should render each user action as a list item', async () => {
      const {element} = await renderComponent();

      const listItems = element.shadowRoot?.querySelectorAll('li');
      expect(listItems?.length).toBeGreaterThan(0);
    });
  });

  describe('when handling case creation sessions', () => {
    it('should hide show more button when areActionsAfterCaseCreationVisible is true', async () => {
      const {element, showMoreButton} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      element.areActionsAfterCaseCreationVisible = true;
      await element.updateComplete;

      expect(showMoreButton()).toBeNull();
    });

    it('should show more actions button when session has actions before case creation', async () => {
      const {showMoreButton} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      expect(showMoreButton()).toBeInTheDocument();
    });

    it('should not show more actions button when session has no actions before case creation', async () => {
      const {showMoreButton} = await renderComponent({
        userActions: mockUserActions,
      });

      expect(showMoreButton()).toBeNull();
    });

    it('should display correct count in show more button label', async () => {
      const {element} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      const button = element.shadowRoot?.querySelector(
        '[part="show-more-actions-button"]'
      );
      expect(button?.textContent).toContain('2'); // 2 actions before case creation
    });

    it('should reveal actions after clicking show more button', async () => {
      const {element, moreActionsSection} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      expect(moreActionsSection()).toBeNull();

      await page.getByRole('button', {name: /more-actions-in-session/}).click();

      await element.updateComplete;
      expect(moreActionsSection()).toBeInTheDocument();
    });
  });

  describe('when userActions prop changes', () => {
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
  });

  describe('#connectedCallback', () => {
    it('should prepare user actions to display on connect', async () => {
      const {element} = await renderComponent({
        userActions: mockUserActionsWithCaseCreation,
      });

      expect(element.userActionsToDisplay.length).toBe(2);
      expect(element.userActionsAfterCaseCreation.length).toBe(2);
    });
  });
});
