import {
  buildUserActions as buildInsightUserActions,
  type UserActionsState as InsightUserActionsState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {
  defaultBindings,
  renderInAtomicInsightInterface,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeUserActions} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/user-actions-controller';
import type {AtomicInsightUserActionsToggle} from './atomic-insight-user-actions-toggle';
import './atomic-insight-user-actions-toggle';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-user-actions-toggle', () => {
  const renderUserActionsToggle = async ({
    userId = 'test-user',
    ticketCreationDateTime = '2024-01-01T00:00:00Z',
    excludedCustomActions = [] as string[],
    userActionsState = {} as Partial<InsightUserActionsState>,
  } = {}) => {
    vi.mocked(buildInsightUserActions).mockReturnValue(
      buildFakeUserActions(userActionsState)
    );

    const {element, atomicInterface} =
      await renderInAtomicInsightInterface<AtomicInsightUserActionsToggle>({
        template: html`
          <atomic-insight-user-actions-toggle
            .userId=${userId}
            .ticketCreationDateTime=${ticketCreationDateTime}
            .excludedCustomActions=${excludedCustomActions}
          ></atomic-insight-user-actions-toggle>
        `,
        selector: 'atomic-insight-user-actions-toggle',
        bindings: defaultBindings,
      });

    const getButton = () => element.shadowRoot?.querySelector('button');
    const getModal = () =>
      atomicInterface.querySelector('atomic-insight-user-actions-modal');

    return {element, atomicInterface, getButton, getModal};
  };

  describe('#initialize', () => {
    it('should call buildInsightUserActions with the engine and options', async () => {
      const {atomicInterface} = await renderUserActionsToggle({
        userId: 'test-user',
        ticketCreationDateTime: '2024-01-01T00:00:00Z',
        excludedCustomActions: ['custom-event'],
      });

      expect(buildInsightUserActions).toHaveBeenCalledWith(
        atomicInterface.bindings.engine,
        {
          options: {
            ticketCreationDate: '2024-01-01T00:00:00Z',
            excludedCustomActions: ['custom-event'],
          },
        }
      );
    });

    it('should set this.userActions to the user actions controller', async () => {
      const {element} = await renderUserActionsToggle();

      expect(element.userActions).toBe(
        vi.mocked(buildInsightUserActions).mock.results[0].value
      );
    });

    it('should bind state to controller', async () => {
      const {element} = await renderUserActionsToggle({
        userActionsState: {
          loading: true,
          excludedCustomActions: ['test-event'],
        },
      });

      expect(element.userActionsState.loading).toBe(true);
      expect(element.userActionsState.excludedCustomActions).toEqual([
        'test-event',
      ]);
    });
  });

  describe('when rendering', () => {
    it('should render the button with the correct aria-label', async () => {
      const {getButton} = await renderUserActionsToggle();

      expect(getButton()).toHaveAttribute('aria-label', 'User actions');
    });

    it('should render the button with the correct title', async () => {
      const {getButton} = await renderUserActionsToggle();

      expect(getButton()).toHaveAttribute('title', 'User actions');
    });

    it('should render the button with the correct part prefix', async () => {
      const {element} = await renderUserActionsToggle();
      const container = element.shadowRoot?.querySelector(
        '[part="insight-user-actions-toggle-container"]'
      );

      expect(container).toBeInTheDocument();
    });

    it('should render the icon within the button', async () => {
      const {element} = await renderUserActionsToggle();
      const icon = element.shadowRoot?.querySelector('atomic-icon');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('part', 'insight-user-actions-toggle-icon');
    });
  });

  describe('modal creation and interaction', () => {
    it('should create the modal when rendered', async () => {
      const {getModal} = await renderUserActionsToggle();

      expect(getModal()).toBeInTheDocument();
    });

    it('should set the openButton of the modal to the button', async () => {
      const {getButton, getModal} = await renderUserActionsToggle();

      expect(getModal()?.openButton).toBe(getButton());
    });

    it('should set the userId of the modal to the component prop', async () => {
      const {getModal} = await renderUserActionsToggle({userId: 'custom-user'});

      expect(getModal()?.userId).toBe('custom-user');
    });

    it('should set the ticketCreationDateTime of the modal to the component prop', async () => {
      const {getModal} = await renderUserActionsToggle({
        ticketCreationDateTime: '2024-06-15T12:00:00Z',
      });

      expect(getModal()?.ticketCreationDateTime).toBe('2024-06-15T12:00:00Z');
    });

    it('should set the excludedCustomActions of the modal to the component prop', async () => {
      const {getModal} = await renderUserActionsToggle({
        excludedCustomActions: ['action1', 'action2'],
      });

      expect(getModal()?.excludedCustomActions).toEqual(['action1', 'action2']);
    });

    it('should open the modal when the button is clicked', async () => {
      const {getButton, getModal} = await renderUserActionsToggle();

      await userEvent.click(getButton()!);

      expect(getModal()?.isOpen).toBe(true);
    });

    it('should call logOpenUserActions when the button is clicked', async () => {
      const {element, getButton} = await renderUserActionsToggle();
      const logOpenUserActionsSpy = vi.spyOn(
        element.userActions,
        'logOpenUserActions'
      );

      await userEvent.click(getButton()!);

      expect(logOpenUserActionsSpy).toHaveBeenCalled();
    });
  });
});
