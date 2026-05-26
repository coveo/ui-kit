export const endpointKeys = {
  conversation: 'conversation',
} as const;

export type EndpointKey = (typeof endpointKeys)[keyof typeof endpointKeys];

export const conversationEndpointKey = endpointKeys.conversation;
