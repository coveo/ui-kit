import type {UserAction as IUserAction} from '@coveo/headless/insight';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {parseTimestampToDateDetails} from '@/src/utils/date-utils';
import Flag from '../../../images/flag.svg';
import ThreeDotsIcon from '../../../images/three-dots.svg';
import {renderUserAction} from './user-action';

/**
 * Internal component used by the `atomic-insight-user-actions-modal`. Do not use directly.
 *
 * The `atomic-insight-user-actions-session` component displays all the user actions that took place during a specific user session.
 *
 * @internal
 *
 * @part session-start-icon__container - The container for the session start icon.
 * @part show-more-actions-button - The button to show more actions in the session.
 */
@customElement('atomic-insight-user-actions-session')
@bindings()
@withTailwindStyles
export class AtomicInsightUserActionsSession
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = css`
    .session-start-icon__container {
      background-color: #fbb439;
    }

    .user-action__separator {
      @apply bg-neutral;
    }

    .ticket-creation-action__text {
      @apply text-success;
    }

    .text-xxs {
      font-size: 0.625rem;
    }
  `;

  @state()
  public bindings!: InsightBindings;

  @state()
  public error!: Error;

  /**
   * The start time of the session as a Unix timestamp.
   */
  @property({type: Number, attribute: 'start-timestamp'})
  public startTimestamp!: number;

  /**
   * The list of user actions performed during the session.
   */
  @property({type: Array, attribute: 'user-actions'})
  public userActions: Array<IUserAction> = [];

  @state()
  private userActionsToDisplay: Array<IUserAction> = [];

  @state()
  private userActionsAfterCaseCreation: Array<IUserAction> = [];

  @state()
  private areActionsAfterCaseCreationVisible = false;

  public initialize() {
    // Component is internal and doesn't need controller initialization
  }

  connectedCallback() {
    super.connectedCallback();
    this.prepareUserActionsToDisplay();
  }

  willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('userActions')) {
      this.prepareUserActionsToDisplay();
    }
  }

  private prepareUserActionsToDisplay() {
    const caseCreationIndex = this.userActions.findIndex(
      ({actionType}) => actionType === 'TICKET_CREATION'
    );
    const isCaseCreationSession = caseCreationIndex !== -1;

    if (!isCaseCreationSession) {
      this.userActionsToDisplay = this.userActions;
      this.userActionsAfterCaseCreation = [];
    } else {
      this.userActionsToDisplay = this.userActions.slice(caseCreationIndex);
      this.userActionsAfterCaseCreation = this.userActions.slice(
        0,
        caseCreationIndex
      );
    }
  }

  private showActionsAfterCaseCreation() {
    this.areActionsAfterCaseCreationVisible = true;
  }

  private renderSessionStartDate() {
    const caseCreationIndex = this.userActions.findIndex(
      ({actionType}) => actionType === 'TICKET_CREATION'
    );
    const isCaseCreationSession = caseCreationIndex !== -1;

    const {year, month, dayOfWeek, day} = parseTimestampToDateDetails(
      this.startTimestamp
    );

    const formatedStartDate = `${dayOfWeek}. ${month} ${day}, ${year}`;
    return html`
      <div data-testid="session-start-date-container" class="flex items-center px-2 pb-3">
        ${when(
          isCaseCreationSession,
          () => html`
            <div
              part="session-start-icon__container"
              class="session-start-icon__container mr-2 flex h-5 w-5 items-center justify-center rounded-full"
            >
              <atomic-icon icon=${Flag} class="h-3 w-3"></atomic-icon>
            </div>
          `
        )}
        <div class="flex-1 font-semibold">${formatedStartDate}</div>
      </div>
    `;
  }

  private renderActions(actions: Array<IUserAction>) {
    return html`
      <ol class="px-3">
        ${actions?.map((action) =>
          renderUserAction({
            props: {
              action,
              bindings: this.bindings,
            },
          })
        )}
      </ol>
    `;
  }

  private renderShowMoreActionsButton() {
    const btnClasses = 'flex items-center p-1 max-w-full';
    const label = this.bindings.i18n.t('more-actions-in-session', {
      count: this.userActionsAfterCaseCreation.length,
    });
    return html`
      <div
        data-testid="show-more-actions-button"
        class="flex items-center px-3 pb-3"
      >
        <div class="flex justify-center pr-2">
          <atomic-icon icon=${ThreeDotsIcon} class="h-3 w-3"></atomic-icon>
        </div>
        <div class="flex-1">
          ${renderButton({
            props: {
              style: 'text-primary',
              part: 'show-more-actions-button',
              class: btnClasses,
              ariaLabel: label,
              onClick: this.showActionsAfterCaseCreation.bind(this),
            },
          })(html`<span class="truncate text-xs font-light">${label}</span>`)}
        </div>
      </div>
    `;
  }

  @bindingGuard()
  public render() {
    const isShowMoreActionsButtonVisible =
      !this.areActionsAfterCaseCreationVisible &&
      !!this.userActionsAfterCaseCreation.length;

    return html`
      <div>
        ${this.renderSessionStartDate()}
        ${when(
          this.areActionsAfterCaseCreationVisible,
          () => html`
            <div data-testid="more-actions-section">
              ${this.renderActions(this.userActionsAfterCaseCreation)}
            </div>
          `
        )}
        ${when(isShowMoreActionsButtonVisible, () =>
          this.renderShowMoreActionsButton()
        )}
        ${this.renderActions(this.userActionsToDisplay)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-user-actions-session': AtomicInsightUserActionsSession;
  }
}
