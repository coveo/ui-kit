import {buildConversationResponse} from './shared.js';
import {
  ActivitySnapshot,
  StateSnapshot,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

const runId = 'schema-fallback-4b5562da';

const surfaceActivitySnapshot: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-next-actions-fallback',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: 'next-actions-surface',
          surfaceType: 'converse',
          catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
          components: [
            {
              id: 'root',
              component: 'NextActionsBar',
              props: {
                componentId: 'next-actions-root',
                componentType: 'next-actions-bar',
              },
            },
          ],
        },
      },
    ],
  },
});

const stateSnapshot: ConverseEvent = StateSnapshot({
  components: {
    'next-actions-root': {
      actions: [
        {text: 'Show me popular products', type: 'followup'},
        {text: 'sports equipment', type: 'search'},
        {text: 'outdoor gear', type: 'search'},
      ],
    },
  },
});

const schemaFallbackEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents: [
    ...toolCall({
      toolCallId: 'tc-render-next-actions',
      toolCallName: 'render_next_actions',
      parentMessageId: 'msg-next-actions-fallback',
      args: {actions: [{text: 'Show me popular products', type: 'followup'}]},
      resultMessageId: 'tc-render-next-actions-result',
      resultContent: '"NextActionsBar rendered."',
    }),
    ...textMessage(
      'msg-next-actions-fallback',
      "I couldn't find any products matching your request. Here are some suggestions to help you find what you're looking for."
    ),
    {...surfaceActivitySnapshot, delayMs: 1200},
    {...stateSnapshot, delayMs: 50},
  ],
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaFallbackEvents};
