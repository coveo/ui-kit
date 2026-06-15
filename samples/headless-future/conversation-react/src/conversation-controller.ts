import {
  buildConversationController,
  buildConversationInterface,
  type ConversationController,
} from '@coveo/headless-future';
import {buildSampleEngine} from './engine.js';

const engine = buildSampleEngine();
const conversation = buildConversationInterface({engine});
const conversationController = buildConversationController({
  interface: conversation,
});

export function getConversationController(): ConversationController {
  return conversationController;
}
