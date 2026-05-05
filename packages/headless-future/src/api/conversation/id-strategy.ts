export type ConversationIdStrategy = {
  newTurnId: () => string;
  newMessageId: () => string;
};

let idCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

export const defaultConversationIdStrategy: ConversationIdStrategy = {
  newTurnId: () => generateId('turn'),
  newMessageId: () => generateId('msg'),
};
