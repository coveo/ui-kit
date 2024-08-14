import {Component, h, Prop, Watch, State} from '@stencil/core';
import Flag from '../../../../images/flag.svg';
import ThreeDotsIcon from '../../../../images/three-dots.svg';
import {parseTimestampToDateDetails} from '../../../../utils/date-utils';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';
import {AtomicInsightUserAction} from '../atomic-insight-user-action/atomic-insight-user-action';

export type UserActionType =
  | 'SEARCH'
  | 'CLICK'
  | 'TICKET_CREATION'
  | 'VIEW'
  | 'CUSTOM';

export type UserAction = {
  type: UserActionType;
  origin: string;
  timestamp: number;
  actionTitle: string;
};

/**
 * @internal
 * The `AtomicInsightUserActionSession` component displays all the user actions that took place during a specific user session.
 * @category Insight Panel
 * @example
 * <atomic-insight-user-actions-session userActions={actions} startTimestamp={1723035731}></atomic-insight-user-actions-session>
 */
@Component({
  tag: 'atomic-insight-user-actions-session',
  styleUrl: 'atomic-insight-user-actions-session.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsSession {
  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  @Prop({mutable: true}) public startTimestamp!: number;
  @Prop({mutable: true}) public userActions: Array<UserAction> = [];
  @Prop({mutable: true}) public isActiveSession = false;

  private caseCreationIndex = -1;
  private userActionsToDisplay: Array<UserAction> = [];
  private userActionsAfterCaseCreation: Array<UserAction> = [];
  private isShowMoreActionsButtonVisible = false;
  @State() areActionsAfterCaseCreationVisible = false;

  connectedCallback() {
    this.prepareUserActionsToDisplay();
  }

  setCaseCreationIndex() {
    this.caseCreationIndex = this.userActions.findIndex(
      (action) => action.type === 'TICKET_CREATION'
    );
  }

  @Watch('userActions')
  prepareUserActionsToDisplay() {
    this.setCaseCreationIndex();

    if (!this.isActiveSession || this.caseCreationIndex === -1) {
      this.userActionsToDisplay = this.userActions;
      this.userActionsAfterCaseCreation = [];
    } else {
      this.userActionsToDisplay = this.userActions.slice(
        this.caseCreationIndex
      );
      this.userActionsAfterCaseCreation = this.userActions.slice(
        0,
        this.caseCreationIndex
      );
    }
  }

  showActionsAfterCaseCreation() {
    this.areActionsAfterCaseCreationVisible = true;
  }

  renderSessionStartDate() {
    const {year, month, dayOfWeek, day} = parseTimestampToDateDetails(
      this.startTimestamp
    );

    const formatedStartDate = `${dayOfWeek}. ${month} ${day}, ${year}`;
    return (
      <div class="flex items-center px-2 pb-3">
        {this.isActiveSession ? (
          <div class="flex-one session-start-icon__container mr-2 flex h-5 w-5 items-center justify-center rounded-full">
            <atomic-icon icon={Flag} class="h-3 w-3"></atomic-icon>
          </div>
        ) : null}

        <div class="flex-1 font-semibold">{formatedStartDate}</div>
      </div>
    );
  }

  renderActions(actions: Array<UserAction>) {
    return (
      <ol class="px-3">
        {actions?.map(({actionTitle, origin, type, timestamp}) => (
          <AtomicInsightUserAction
            actionTitle={actionTitle}
            origin={origin}
            type={type}
            timestamp={timestamp}
            bindings={this.bindings}
          ></AtomicInsightUserAction>
        ))}
      </ol>
    );
  }

  renderShowMoreActionsButton() {
    return (
      <div class="px-3 pb-3">
        <div class="flex">
          <div class="flex-none pr-2">
            <div class="flex justify-center py-1">
              <atomic-icon icon={ThreeDotsIcon} class="h-3 w-3"></atomic-icon>
            </div>
          </div>
          <div class="flex-1">
            <button
              onClick={this.showActionsAfterCaseCreation.bind(this)}
              class="btn-text-primary flex items-center"
            >
              {this.bindings.i18n.t('more-actions-in-session', {
                count: this.userActionsAfterCaseCreation.length,
              })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  public render() {
    this.isShowMoreActionsButtonVisible =
      !this.areActionsAfterCaseCreationVisible &&
      !!this.userActionsAfterCaseCreation.length;

    return (
      <div>
        {this.renderSessionStartDate()}

        {this.areActionsAfterCaseCreationVisible &&
          this.renderActions(this.userActionsAfterCaseCreation)}

        {this.isShowMoreActionsButtonVisible &&
          this.renderShowMoreActionsButton()}

        {this.renderActions(this.userActionsToDisplay)}
      </div>
    );
  }
}
