const followingSessionsActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: new Date('2024-09-01T15:30:00Z').valueOf(),
  },
];

const ticketCreationSessionActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"errors","event_value":"One","origin_level_1":"default","origin_level_2":"default"}',
    time: new Date('2024-08-30T00:10:00Z').valueOf(),
  },
];

const precedingSessionsActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: new Date('2024-08-29T15:40:00Z').valueOf(),
  },
];

export const exampleUserActionsData = [
  ...followingSessionsActions,
  ...ticketCreationSessionActions,
  ...precedingSessionsActions,
];
