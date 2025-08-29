import {
  buildUserActions as buildInsightUserActions,
  UserActions as InsightUserActions,
  UserActionsState as InsightUserActionsState,
  UserSession as InsightUserSession,
} from '@coveo/headless/insight';
import {Component, h, State, Prop} from '@stencil/core';
import ArrowDownIcon from '../../../../images/big-arrow-down.svg';
import ArrowUpIcon from '../../../../images/big-arrow-up.svg';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
import {NoItemsContainer} from '../../../common/no-items/stencil-container';
import {MagnifyingGlass} from '../../../common/no-items/stencil-magnifying-glass';
import {Button} from '../../../common/stencil-button';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * Internal component used by the `atomic-insight-user-actions-modal`. Do not use directly.
 * 
 * This component displays all the actions performed by a user around the time they created a case.
 * The actions are grouped into multiple sessions, including the session during which the case was created,
 * the sessions preceding the case creation and the sessions following the case creation.
 *
 * @component
 * @example
 * <AtomicInsightUserActionsTimeline userId={'123'} caseCreationDate={'2024-08-15T10:00:00Z'} />
 *
 */
@Component({
  tag: 'atomic-insight-user-actions-timeline',
  styleUrl: 'atomic-insight-user-actions-timeline.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsTimeline
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public userActions!: InsightUserActions;

  @BindStateToController('userActions')
  @State()
  public userActionsState!: InsightUserActionsState;
  public error!: Error;

  /**
   * The ID of the user whose actions are being displayed. For example in email format "someone@company.com".
   */
  @Prop() public userId!: string;
  /**
   * The date and time when the case was created. For example "2024-01-01T00:00:00Z"
   */
  @Prop() public ticketCreationDateTime!: string;
  /**
   * The names of custom events to exclude.
   */
  @Prop() public excludedCustomActions: string[] = [];

  public initialize() {
    this.userActions = buildInsightUserActions(this.bindings.engine, {
      options: {
        ticketCreationDate: this.ticketCreationDateTime,
        excludedCustomActions: this.excludedCustomActions,
      },
    });

    this.userActions.fetchUserActions(this.userId);
  }

  @State() followingSessionsAreVisible = false;
  @State() precedingSessionsAreVisible = false;

  private toggleFollowingSessions() {
    this.followingSessionsAreVisible = !this.followingSessionsAreVisible;
  }

  private togglePrecedingSessions() {
    this.precedingSessionsAreVisible = !this.precedingSessionsAreVisible;
  }

  private renderSessions(
    sessions: Array<InsightUserSession> | undefined,
    renderSeparator?: Function,
    testId?: string
  ) {
    return (
      <div>
        {sessions?.map(({actions, start}) => [
          <div class="mt-4">
            <atomic-insight-user-actions-session
              startTimestamp={start}
              userActions={actions}
              data-testid={testId}
            ></atomic-insight-user-actions-session>
          </div>,
          renderSeparator ? renderSeparator() : null,
        ])}
      </div>
    );
  }

  private renderToggleFollowingSessionsButton() {
    const btnClasses = 'flex items-center text-left p-2 text-sm max-w-full';
    const iconClasses = 'h-3 w-3 mr-1';
    const label = this.followingSessionsAreVisible
      ? this.bindings.i18n.t('hide-following-sessions')
      : this.bindings.i18n.t('show-following-sessions');
    const icon = this.followingSessionsAreVisible ? ArrowDownIcon : ArrowUpIcon;

    return (
      <div class="flex justify-center p-2">
        <Button
          style="text-primary"
          part="toggle-following-sessions"
          class={btnClasses}
          ariaLabel={label}
          onClick={this.toggleFollowingSessions.bind(this)}
        >
          <atomic-icon
            part="toggle-following-sessions-icon"
            class={iconClasses}
            icon={icon}
          ></atomic-icon>
          <span class="truncate">{label}</span>
        </Button>
      </div>
    );
  }

  private renderTogglePrecedingSessionsButton() {
    const btnClasses = 'flex items-center text-left p-2 text-sm max-w-full';
    const iconClasses = 'h-3 w-3 mr-1';
    const label = this.precedingSessionsAreVisible
      ? this.bindings.i18n.t('hide-preceding-sessions')
      : this.bindings.i18n.t('show-preceding-sessions');
    const icon = this.precedingSessionsAreVisible ? ArrowUpIcon : ArrowDownIcon;

    return (
      <div class="flex justify-center p-2">
        <Button
          style="text-primary"
          part="toggle-preceding-sessions"
          class={btnClasses}
          ariaLabel={label}
          onClick={this.togglePrecedingSessions.bind(this)}
        >
          <atomic-icon
            part="toggle-preceding-sessions-icon"
            class={iconClasses}
            icon={icon}
          ></atomic-icon>
          <span class="truncate">{label}</span>
        </Button>
      </div>
    );
  }

  private renderFollowingSessionsSection() {
    if (!this.userActionsState.timeline?.followingSessions?.length) {
      return null;
    }
    return [
      this.renderToggleFollowingSessionsButton(),
      <div class="separator mx-1 rounded"></div>,
      this.followingSessionsAreVisible
        ? this.renderSessions(
            this.userActionsState.timeline?.followingSessions,
            () => <div class="separator mx-1 mt-4 rounded"></div>,
            'following-session'
          )
        : null,
    ];
  }

  private renderPrecedingSessionsSection() {
    if (!this.userActionsState.timeline?.precedingSessions?.length) {
      return null;
    }
    return [
      <div class="separator mx-1 mt-4 rounded"></div>,
      this.precedingSessionsAreVisible
        ? this.renderSessions(
            this.userActionsState.timeline?.precedingSessions,
            () => <div class="separator mx-1 mt-4 rounded"></div>,
            'preceding-session'
          )
        : null,
      this.renderTogglePrecedingSessionsButton(),
    ];
  }

  private renderTimeline() {
    return (
      <div>
        {this.renderFollowingSessionsSection()}
        <div class="mt-4">
          <atomic-insight-user-actions-session
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            startTimestamp={this.userActionsState.timeline?.session?.start!}
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            userActions={this.userActionsState?.timeline?.session?.actions!}
            data-testid="active-session"
          ></atomic-insight-user-actions-session>
        </div>
        {this.renderPrecedingSessionsSection()}
      </div>
    );
  }

  private renderNoUserActionsScreen() {
    return (
      <div class="my-6 py-3" data-testid="user-actions-error">
        <NoItemsContainer>
          <MagnifyingGlass />
          <div class="my-2 max-w-full text-center text-2xl font-light">
            {this.bindings.i18n.t('no-user-actions-available')}
          </div>
          <div class="text-neutral-dark my-2 text-center text-lg">
            {this.bindings.i18n.t('no-user-actions-associated-with-params')}
          </div>
        </NoItemsContainer>
      </div>
    );
  }

  render() {
    const areUserActionsAvailable = this.userActionsState.timeline?.session;
    const hasError = this.userActionsState.error;

    if (areUserActionsAvailable && !hasError) {
      return this.renderTimeline();
    }
    return this.renderNoUserActionsScreen();
  }
}
