import {Component, h, State, Prop} from '@stencil/core';
import {
  buildUserActions,
  UserActions,
  UserActionsState,
  UserSession,
} from '../..';
import ArrowDownIcon from '../../../../images/arrow-full-down.svg';
import ArrowUpIcon from '../../../../images/arrow-up.svg';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
import {NoItemsContainer} from '../../../common/no-items/container';
import {MagnifyingGlass} from '../../../common/no-items/magnifying-glass';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * This component displays all the actions performed by a user around the time they created a case.
 * The actions are grouped into multiple sessions, including the session during which the case was created,
 * the sessions preceding the case creation, and the sessions following the case creation.
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
  public userActions!: UserActions;

  @BindStateToController('userActions')
  @State()
  public userActionsState!: UserActionsState;
  public error!: Error;

  /**
   * The ID of the user whose actions are being displayed.
   */
  @Prop() public userId!: string;
  /**
   * The date and time when the case was created..
   */
  @Prop() public ticketCreationDate!: string;

  public initialize() {
    this.userActions = buildUserActions(this.bindings.engine, {
      options: {ticketCreationDate: this.ticketCreationDate},
    });

    this.userActions.fetchUserActions(this.userId);
  }

  @State() followingSessionsShouldBeVisible = false;
  @State() precedingShouldBeVisible = false;

  private toggleFollowingSessions() {
    this.followingSessionsShouldBeVisible =
      !this.followingSessionsShouldBeVisible;
  }

  private togglePrecedingSessions() {
    this.precedingShouldBeVisible = !this.precedingShouldBeVisible;
  }

  private renderSessions(
    sessions: Array<UserSession> | undefined,
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
    return (
      <div class="flex justify-center p-2">
        <button
          onClick={this.toggleFollowingSessions.bind(this)}
          class="btn-text-primary flex items-center p-2"
          data-testid={
            this.followingSessionsShouldBeVisible
              ? 'hide-following-sessions'
              : 'show-following-sessions'
          }
        >
          <atomic-icon
            class="mr-1.5 h-3 w-3"
            icon={
              this.followingSessionsShouldBeVisible
                ? ArrowDownIcon
                : ArrowUpIcon
            }
          ></atomic-icon>
          {this.followingSessionsShouldBeVisible
            ? 'Hide following sessions'
            : 'Show following sessions'}
        </button>
      </div>
    );
  }

  private renderTogglePrecedingSessionsButton() {
    return (
      <div class="flex justify-center p-2">
        <button
          onClick={this.togglePrecedingSessions.bind(this)}
          class="btn-text-primary flex items-center p-2"
          data-testid={
            this.precedingShouldBeVisible
              ? 'hide-preceding-sessions'
              : 'show-preceding-sessions'
          }
        >
          <atomic-icon
            class="mr-1.5 h-3 w-3"
            icon={this.precedingShouldBeVisible ? ArrowUpIcon : ArrowDownIcon}
          ></atomic-icon>
          {this.precedingShouldBeVisible
            ? 'Hide preceding sessions'
            : 'Show preceding sessions'}
        </button>
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
      this.followingSessionsShouldBeVisible
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
      this.precedingShouldBeVisible
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
            startTimestamp={this.userActionsState?.timeline?.session?.start!}
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
