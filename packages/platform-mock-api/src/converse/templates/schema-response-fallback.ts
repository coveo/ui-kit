import {
  CATALOG_ID,
  bindStateFields,
  buildConversationResponse,
  createProgressBlock,
  statePath,
  updateProgressBlock,
  type ProgressStep,
} from './shared.js';
import {
  ActivitySnapshot,
  UpdateDataModelActivity,
  textMessage,
  toolCall,
  type ConverseEvent,
} from '../events.js';

const runId = 'schema-fallback-4b5562da';

const NEXT_ACTIONS_SURFACE_ID = 'next-actions-surface';
const NEXT_ACTIONS_ROOT_ID = 'root';

const surfaceActivitySnapshot: ConverseEvent = ActivitySnapshot({
  messageId: 'activity-next-actions-fallback',
  activityType: 'a2ui-surface',
  replace: true,
  content: {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: NEXT_ACTIONS_SURFACE_ID,
          catalogId: CATALOG_ID,
          components: [
            {
              id: NEXT_ACTIONS_ROOT_ID,
              component: 'NextActionsBar',
              ...bindStateFields(NEXT_ACTIONS_ROOT_ID, ['suggestedActions']),
            },
          ],
        },
      },
    ],
  },
});

const stateActivity: ConverseEvent = UpdateDataModelActivity({
  messageId: 'activity-next-actions-fallback-state',
  ops: [
    {
      surfaceId: NEXT_ACTIONS_SURFACE_ID,
      path: statePath(NEXT_ACTIONS_ROOT_ID),
      value: {
        suggestedActions: [
          {text: 'Show me popular products', type: 'followup'},
          {text: 'sports equipment', type: 'search'},
          {text: 'outdoor gear', type: 'search'},
        ],
      },
    },
  ],
});

const THINKING: ProgressStep = {id: 'thinking', label: 'Thinking'};
const PREPARING_RESPONSE: ProgressStep = {id: 'preparing_response', label: 'Putting it together'};

const schemaFallbackEvents: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents: [
    createProgressBlock([THINKING]),
    ...toolCall({
      toolCallId: 'tc-render-next-actions',
      toolCallName: 'render_next_actions',
      parentMessageId: 'msg-next-actions-fallback',
      args: {actions: [{text: 'Show me popular products', type: 'followup'}]},
      resultMessageId: 'tc-render-next-actions-result',
      resultContent: '"NextActionsBar rendered."',
    }),
    {...updateProgressBlock([THINKING], [PREPARING_RESPONSE]), delayMs: 400},
    ...textMessage(
      'msg-next-actions-fallback',
      "I couldn't find any products matching your request. Here are some suggestions to help you find what you're looking for."
    ),
    {...surfaceActivitySnapshot, delayMs: 1200},
    {...stateActivity, delayMs: 50},
    updateProgressBlock([THINKING, PREPARING_RESPONSE]),
  ],
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {schemaFallbackEvents};
