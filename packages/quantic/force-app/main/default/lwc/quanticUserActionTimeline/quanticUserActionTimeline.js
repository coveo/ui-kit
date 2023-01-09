import {LightningElement, api} from 'lwc';
// @ts-ignore
import errorTemplate from './quanticUserActionError.html';
// @ts-ignore
import loadingTemplate from './quanticUserActionLoading.html';
// @ts-ignore
import timelineTemplate from './quanticUserActionTimeline.html';
import showPrecedingSessions from '@salesforce/label/c.quantic_ShowPrecedingSessions';
import hidePrecedingSessions from '@salesforce/label/c.quantic_HidePrecedingSessions';
import showFollowingSessions from '@salesforce/label/c.quantic_ShowFollowingSessions';
import hideFollowingSessions from '@salesforce/label/c.quantic_HideFollowingSessions';
import noActionsAvailable from '@salesforce/label/c.quantic_NoActionsAvailable';
import contactYourAdministratorForHelp from '@salesforce/label/c.quantic_ContactYourAdministratorForHelp';
import potentialCauses from '@salesforce/label/c.quantic_PotentialCauses';
import noUserActionsAssociated from '@salesforce/label/c.quantic_NoUserActionsAssociated';
import eventsHaveBeenFiltered from '@salesforce/label/c.quantic_EventsHaveBeenFiltered';





export default class QuanticUserActionTimeline extends LightningElement {
  @api engineId;
  @api caseId;

  labels = {
    showFollowingSessions,
    showPrecedingSessions,
    hideFollowingSessions,
    hidePrecedingSessions,
    noActionsAvailable,
    contactYourAdministratorForHelp,
    potentialCauses,
    noUserActionsAssociated,
    eventsHaveBeenFiltered
  }

  session = {
    start: 1672778845000,
    end: 1672778845000,
    actions: [
      {
        type: 'click',
        title: 'How to - Speedbit Blaze pairing with Android',
        searchHub: 'Community Case creation',
        timestamp: 1672778845003,
      },
      {
        type: 'search',
        title: 'Speedbit Blaze pairing to Android',
        searchHub: 'Community Case creation',
        timestamp: 1672778845004,
      },
      {
        type: 'view',
        title: 'Speedbit Blaze pairing to Android',
        searchHub: 'Community Case creation',
        timestamp: 1672778845005,
      },
    ],
  };
  followingSessions = [this.session, this.session];
  precedingSessions = [this.session, this.session];

  followingSessionsAreVisible = false;
  precedingSessionsAreVisible = false;
  error = true;
  loading = false;

  toggleFollowingSessions() {
    this.followingSessionsAreVisible = !this.followingSessionsAreVisible;
  }

  togglePrecedingSessions() {
    this.precedingSessionsAreVisible = !this.precedingSessionsAreVisible;
  }

  get showFollowingSessionIcon() {
    return `utility:${
      this.followingSessionsAreVisible ? 'arrowdown' : 'arrowup'
    }`;
  }

  get showFollowingSessionLabel() {
    return this.followingSessionsAreVisible
      ? this.labels.hideFollowingSessions
      : this.labels.showFollowingSessions;
  }

  get showPrecedingSessionIcon() {
    return `utility:${
      this.precedingSessionsAreVisible ? 'arrowup' : 'arrowdown'
    }`;
  }

  get showPrecedingSessionLabel() {
    return this.precedingSessionsAreVisible
      ? this.labels.hidePrecedingSessions
      : this.labels.showPrecedingSessions;
  }

  render() {
    if (this.error) {
      return errorTemplate;
    }
    if (this.loading) {
      return loadingTemplate;
    }
    return timelineTemplate;
  }
}
