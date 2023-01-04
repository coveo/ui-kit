import {LightningElement} from 'lwc';
// @ts-ignore
import errorTemplate from './quanticUserActionError.html';
// @ts-ignore
import timelineTemplate from './quanticUserActionTimeline.html';

export default class QuanticUserActionTimeline extends LightningElement {
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
  error = false;

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
      ? 'Hide following sessions'
      : 'Show following sessions';
  }

  get showPrecedingSessionIcon() {
    return `utility:${
      this.precedingSessionsAreVisible ? 'arrowup' : 'arrowdown'
    }`;
  }

  get showPrecedingSessionLabel() {
    return this.precedingSessionsAreVisible
      ? 'Hide preceding sessions'
      : 'Show preceding sessions';
  }

  render() {
    if (this.error) {
      return errorTemplate;
    }
    return timelineTemplate;
  }
}
