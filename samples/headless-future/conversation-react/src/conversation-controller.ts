import {
  buildConversationController,
  type ConversationController,
} from '@coveo/headless-future';
import {buildSampleEngine} from './engine.js';

const engine = buildSampleEngine();
const conversationController = buildConversationController({engine});

export function getConversationController(): ConversationController {
  return conversationController;
}
