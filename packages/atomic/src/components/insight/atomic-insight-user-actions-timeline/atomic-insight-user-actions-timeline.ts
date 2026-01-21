import {
  buildUserActions as buildInsightUserActions,
  type UserActions as InsightUserActions,
  type UserActionsState as InsightUserActionsState,
  type UserSession as InsightUserSession,
} from '@coveo/headless/insight';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import {renderNoItemsContainer} from '@/src/components/common/no-items/container';
import {renderMagnifyingGlass} from '@/src/components/common/no-items/magnifying-glass';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import ArrowDownIcon from '../../../images/big-arrow-down.svg';
import ArrowUpIcon from '../../../images/big-arrow-up.svg';

/**
 * Internal component used by the `atomic-insight-user-actions-modal`. Do not use directly.
 *
 * The `atomic-insight-user-actions-timeline` component displays all the actions performed by a user around the time they created a case.
 * The actions are grouped into multiple sessions, including the session during which the case was created,
 * the sessions preceding the case creation and the sessions following the case creation.
 *
 * @part toggle-following-sessions - The button to toggle the visibility of following sessions.
 * @part toggle-following-sessions-icon - The icon displayed on the toggle following sessions button.
 * @part toggle-preceding-sessions - The button to toggle the visibility of preceding sessions.
 * @part toggle-preceding-sessions-icon - The icon displayed on the toggle preceding sessions button.
 */
@customElement('atomic-insight-user-actions-timeline')
@bindings()
@withTailwindStyles
export class AtomicInsightUserActionsTimeline
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = css`
    @reference '../../../../utils/tailwind.global.tw.css';

    .separator {
      height: 1px;
      background-color: #e0e1dd;
    }
  `;

  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  public userActions!: InsightUserActions;

  @bindStateToController('userActions')
  @state()
  public userActionsState!: InsightUserActionsState;

  /**
   * The ID of the user whose actions are being displayed. For example in email format "someone@company.com".
   */
  @property({type: String, attribute: 'user-id'}) public userId!: string;

  /**
   * The date and time when the case was created. For example "2024-01-01T00:00:00Z"
   */
  @property({type: String, attribute: 'ticket-creation-date-time'})
  public ticketCreationDateTime!: string;

  /**
   * The names of custom events to exclude.
   */
  @property({type: Array, attribute: 'excluded-custom-actions'})
  public excludedCustomActions: string[] = [];

  @state() private followingSessionsAreVisible = false;
  @state() private precedingSessionsAreVisible = false;

  public initialize() {
    this.userActions = buildInsightUserActions(this.bindings.engine, {
      options: {
        ticketCreationDate: this.ticketCreationDateTime,
        excludedCustomActions: this.excludedCustomActions,
      },
    });

    this.userActions.fetchUserActions(this.userId);
  }

  private toggleFollowingSessions() {
    this.followingSessionsAreVisible = !this.followingSessionsAreVisible;
  }

  private togglePrecedingSessions() {
    this.precedingSessionsAreVisible = !this.precedingSessionsAreVisible;
  }

  private renderSessions(
    sessions: Array<InsightUserSession> | undefined,
    renderSeparator?: () => unknown,
    testId?: string
  ) {
    if (!sessions) {
      return nothing;
    }

    return html`
      <div>
        ${sessions.map(
          ({actions, start}) => html`
            <div class="mt-4">
              <atomic-insight-user-actions-session
                .startTimestamp=${start}
                .userActions=${actions}
                data-testid=${testId}
              ></atomic-insight-user-actions-session>
            </div>
            ${renderSeparator ? renderSeparator() : nothing}
          `
        )}
      </div>
    `;
  }

  private renderToggleFollowingSessionsButton() {
    const btnClasses = 'flex items-center text-left p-2 text-sm max-w-full';
    const iconClasses = 'h-3 w-3 mr-1';
    const label = this.followingSessionsAreVisible
      ? this.bindings.i18n.t('hide-following-sessions')
      : this.bindings.i18n.t('show-following-sessions');
    const icon = this.followingSessionsAreVisible ? ArrowDownIcon : ArrowUpIcon;

    return html`
      <div class="flex justify-center p-2">
        ${renderButton({
          props: {
            style: 'text-primary',
            part: 'toggle-following-sessions',
            class: btnClasses,
            ariaLabel: label,
            onClick: this.toggleFollowingSessions.bind(this),
          },
        })(html`
          <atomic-icon
            part="toggle-following-sessions-icon"
            class=${iconClasses}
            .icon=${icon}
          ></atomic-icon>
          <span class="truncate">${label}</span>
        `)}
      </div>
    `;
  }

  private renderTogglePrecedingSessionsButton() {
    const btnClasses = 'flex items-center text-left p-2 text-sm max-w-full';
    const iconClasses = 'h-3 w-3 mr-1';
    const label = this.precedingSessionsAreVisible
      ? this.bindings.i18n.t('hide-preceding-sessions')
      : this.bindings.i18n.t('show-preceding-sessions');
    const icon = this.precedingSessionsAreVisible ? ArrowUpIcon : ArrowDownIcon;

    return html`
      <div class="flex justify-center p-2">
        ${renderButton({
          props: {
            style: 'text-primary',
            part: 'toggle-preceding-sessions',
            class: btnClasses,
            ariaLabel: label,
            onClick: this.togglePrecedingSessions.bind(this),
          },
        })(html`
          <atomic-icon
            part="toggle-preceding-sessions-icon"
            class=${iconClasses}
            .icon=${icon}
          ></atomic-icon>
          <span class="truncate">${label}</span>
        `)}
      </div>
    `;
  }

  private renderFollowingSessionsSection() {
    if (!this.userActionsState.timeline?.followingSessions?.length) {
      return nothing;
    }
    return html`
      ${this.renderToggleFollowingSessionsButton()}
      <div class="separator mx-1 rounded"></div>
      ${when(this.followingSessionsAreVisible, () =>
        this.renderSessions(
          this.userActionsState.timeline?.followingSessions,
          () => html`<div class="separator mx-1 mt-4 rounded"></div>`,
          'following-session'
        )
      )}
    `;
  }

  private renderPrecedingSessionsSection() {
    if (!this.userActionsState.timeline?.precedingSessions?.length) {
      return nothing;
    }
    return html`
      <div class="separator mx-1 mt-4 rounded"></div>
      ${when(this.precedingSessionsAreVisible, () =>
        this.renderSessions(
          this.userActionsState.timeline?.precedingSessions,
          () => html`<div class="separator mx-1 mt-4 rounded"></div>`,
          'preceding-session'
        )
      )}
      ${this.renderTogglePrecedingSessionsButton()}
    `;
  }

  private renderTimeline() {
    const session = this.userActionsState.timeline?.session;
    if (!session) {
      return nothing;
    }

    return html`
      <div>
        ${this.renderFollowingSessionsSection()}
        <div class="mt-4">
          <atomic-insight-user-actions-session
            .startTimestamp=${session.start}
            .userActions=${session.actions}
            data-testid="active-session"
          ></atomic-insight-user-actions-session>
        </div>
        ${this.renderPrecedingSessionsSection()}
      </div>
    `;
  }

  private renderNoUserActionsScreen() {
    return html`
      <div class="my-6 py-3" data-testid="user-actions-error">
        ${renderNoItemsContainer()(html`
          ${renderMagnifyingGlass()}
          <div class="my-2 max-w-full text-center text-2xl font-light">
            ${this.bindings.i18n.t('no-user-actions-available')}
          </div>
          <div class="text-neutral-dark my-2 text-center text-lg">
            ${this.bindings.i18n.t('no-user-actions-associated-with-params')}
          </div>
        `)}
      </div>
    `;
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

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-user-actions-timeline': AtomicInsightUserActionsTimeline;
  }
}
