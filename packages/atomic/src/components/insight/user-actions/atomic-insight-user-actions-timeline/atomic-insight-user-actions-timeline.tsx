import {Component, h, State} from '@stencil/core';
import ArrowDownIcon from '../../../../images/arrow-full-down.svg';
import ArrowUpIcon from '../../../../images/arrow-up.svg';
import {NoItemsContainer} from '../../../common/no-items/container';
import {MagnifyingGlass} from '../../../common/no-items/magnifying-glass';
import {
  UserActionType,
  UserActions,
} from '../atomic-insight-user-action-session/atomic-insight-user-actions-session';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-user-actions-timeline',
  styleUrl: 'atomic-insight-user-actions-timeline.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsTimeline {
  @State() private timeline = {
    precedingSessions: [
      {
        start: 1723035872,
        end: 1723035872,
        actions: [
          {
            type: 'CUSTOM' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Custom event',
          },
          {
            type: 'VIEW' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'How to - Speedbit Blaze pairing with Android',
          },
          {
            type: 'SEARCH' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Speedbit Blaze pairing to Android ',
          },
        ],
      },
      {
        start: 1723035872,
        end: 1723035872,
        actions: [
          {
            type: 'CUSTOM' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Custom event',
          },
          {
            type: 'VIEW' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'How to - Speedbit Blaze pairing with Android',
          },
          {
            type: 'SEARCH' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Speedbit Blaze pairing to Android ',
          },
        ],
      },
    ],
    session: {
      start: 1723035872,
      end: 1723035872,
      actions: [
        {
          type: 'CLICK' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'How to - Speedbit Blaze pairing with Android',
        },
        {
          type: 'CUSTOM' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'Speedbit Blaze pairing to Android ',
        },
        {
          type: 'TICKET_CREATION' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'How to - Speedbit Blaze pairing with Android',
        },
        {
          type: 'CLICK' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'How to - Speedbit Blaze pairing with Android',
        },
        {
          type: 'CUSTOM' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'Speedbit Blaze pairing to Android ',
        },
        {
          type: 'VIEW' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'How to - Speedbit Blaze pairing with Android',
        },
        {
          type: 'SEARCH' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'How to - Speedbit Blaze pairing with Android',
        },
        {
          type: 'CUSTOM' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'Custom event',
        },
        {
          type: 'SEARCH' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'How to - Speedbit Blaze pairing with Android',
        },
        {
          type: 'CUSTOM' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'Custom event',
        },
        {
          type: 'VIEW' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'How to - Speedbit Blaze pairing with Android',
        },
        {
          type: 'SEARCH' as UserActionType,
          origin: 'Community case creation',
          timestamp: 1723035872,
          actionTitle: 'Speedbit Blaze pairing to Android ',
        },
      ],
    },
    followingSessions: [
      {
        start: 1723035872,
        end: 1723035872,
        actions: [
          {
            type: 'CUSTOM' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Custom event',
          },
          {
            type: 'VIEW' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'How to - Speedbit Blaze pairing with Android',
          },
          {
            type: 'SEARCH' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Speedbit Blaze pairing to Android ',
          },
        ],
      },
      {
        start: 1723035872,
        end: 1723035872,
        actions: [
          {
            type: 'CUSTOM' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Custom event',
          },
          {
            type: 'VIEW' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'How to - Speedbit Blaze pairing with Android',
          },
          {
            type: 'SEARCH' as UserActionType,
            origin: 'Community case creation',
            timestamp: 1723035872,
            actionTitle: 'Speedbit Blaze pairing to Android ',
          },
        ],
      },
    ],
  };

  @State() followingSessionsShouldBeVisible = false;
  @State() precedingShouldBeVisible = false;

  toggleFollowingSessions() {
    this.followingSessionsShouldBeVisible =
      !this.followingSessionsShouldBeVisible;
  }

  togglePrecedingSessions() {
    this.precedingShouldBeVisible = !this.precedingShouldBeVisible;
  }

  renderSessions(
    sessions: Array<{start: number; actions: UserActions}>,
    renderSeparator?: Function,
    testId?: string
  ) {
    return (
      <div>
        {sessions?.map(({actions, start}) => [
          <div class="mt-4">
            <atomic-insight-user-actions-session
              startDate={start}
              userActions={actions}
              data-testid={testId}
            ></atomic-insight-user-actions-session>
          </div>,
          renderSeparator ? renderSeparator() : null,
        ])}
      </div>
    );
  }

  renderToggleFollowingSessionsButton() {
    return (
      <div class="flex justify-center p-4">
        <button
          onClick={this.toggleFollowingSessions.bind(this)}
          class="btn-text-primary flex items-center"
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

  renderTogglePrecedingSessionsButton() {
    return (
      <div class="flex justify-center p-4">
        <button
          onClick={this.togglePrecedingSessions.bind(this)}
          class="btn-text-primary flex items-center"
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

  renderFollowingSessionsSection() {
    return [
      this.renderToggleFollowingSessionsButton(),
      <div class="separator rounded"></div>,
      this.followingSessionsShouldBeVisible
        ? this.renderSessions(
            this.timeline.followingSessions,
            () => <div class="separator mt-4 rounded"></div>,
            'following-session'
          )
        : null,
    ];
  }

  renderPrecedingSessionsSection() {
    return [
      <div class="separator mt-4 rounded"></div>,
      this.precedingShouldBeVisible
        ? this.renderSessions(
            this.timeline.precedingSessions,
            () => <div class="separator mt-4 rounded"></div>,
            'preceding-session'
          )
        : null,
      this.renderTogglePrecedingSessionsButton(),
    ];
  }

  renderTimeline() {
    return (
      <div>
        {this.renderFollowingSessionsSection()}
        <div class="mt-4">
          <atomic-insight-user-actions-session
            isActiveSession
            startDate={this.timeline.session.start}
            userActions={this.timeline.session.actions}
            data-testid="active-session"
          ></atomic-insight-user-actions-session>
        </div>
        {this.renderPrecedingSessionsSection()}
      </div>
    );
  }

  renderNoUserActionsScreen() {
    return (
      <div class="my-6 py-3">
        <NoItemsContainer>
          <MagnifyingGlass />
          <div class="my-2 max-w-full text-center text-2xl font-light">
            No user actions available
          </div>
          <div class="text-neutral-dark my-2 text-center text-lg">
            There are no user actions associated with the userid or the case is
            too old to detect related actions.
          </div>
        </NoItemsContainer>
      </div>
    );
  }

  render() {
    return this.renderTimeline();
  }
}
