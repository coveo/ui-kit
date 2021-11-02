import {EventSelectors} from './event-selectors';

export const EventExpectations = {
  receivedEvent: (received: boolean, eventType: string) =>
    EventSelectors[
      received ? 'eventsReceived' : 'eventsNotReceived'
    ]().contains(eventType),
};
