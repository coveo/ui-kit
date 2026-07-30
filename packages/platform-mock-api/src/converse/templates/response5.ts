import {buildConversationResponse} from './shared.js';
import type {ConverseEvent} from '../events.js';

const runId = '4b5562da-50df-4735-bf9d-82eb71e76139';

const middleEvents: ConverseEvent[] = [
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_START',
      messageId: '7c45349d-d92f-475c-8378-6385f8fd6b6d',
      role: 'assistant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '7c45349d-d92f-475c-8378-6385f8fd6b6d',
      delta: "I'll search",
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '7c45349d-d92f-475c-8378-6385f8fd6b6d',
      delta: ' for products matching',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '7c45349d-d92f-475c-8378-6385f8fd6b6d',
      delta: ' "[UNHANDLED_PROMPT]" for you.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_END',
      messageId: '7c45349d-d92f-475c-8378-6385f8fd6b6d',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_GcomTQByPP3eWTRev7xCIl',
      toolCallName: 'coveo_commerce_search',
      parentMessageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_GcomTQByPP3eWTRev7xCIl',
      delta: '{"query": "[UNHANDLED_PROMPT]", "perPage": 6}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_GcomTQByPP3eWTRev7xCIl',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: '13c445f3-0205-45b0-b914-02c49985a675',
      toolCallId: 'tooluse_GcomTQByPP3eWTRev7xCIl',
      content: '"No products found."',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_START',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      role: 'assistant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: 'I couldn',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: '\'t find any products matching "feedlif',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: 'ee."',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: ' Let me check',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: ' for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: ' suggestions',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: ' to',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: ' help',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: ' find',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: ' what',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
      delta: " you're looking for.",
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_END',
      messageId: '0ca8616d-3ddd-413e-a206-97474d6895b1',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_uoThigpZSAqScENGJ4UH5z',
      toolCallName: 'coveo_query_suggest',
      parentMessageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_uoThigpZSAqScENGJ4UH5z',
      delta: '{"query": "[UNHANDLED_PROMPT]", "count": 5}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_uoThigpZSAqScENGJ4UH5z',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: '605ec51e-076c-49bf-a849-7b250a2c8f3a',
      toolCallId: 'tooluse_uoThigpZSAqScENGJ4UH5z',
      content: '"No suggestions found."',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_START',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      role: 'assistant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: 'I couldn',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: "'t find any products",
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' or',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' suggestions for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' "[UNHANDLED_PROMPT]"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' in our',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' catalog',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: '. This term',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' doesn',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: "'t match",
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' any products we',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' carry',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: '.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: '\n\nCould',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' you clar',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: "ify what you're looking for? For",
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' example:\n- Are you searching',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' for a specific brand',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' or product category?\n- Was',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' there',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' a ty',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: 'po in the',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: ' name',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
      delta: '?',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_END',
      messageId: 'f90ed556-b9ef-4d03-84db-8c11966edde2',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_qkQi4iUnTHGyKsjuxb8zJd',
      toolCallName: 'render_next_actions',
      parentMessageId: 'd06d1286-ec52-44e9-9950-b8e791a9c8fa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'ACTIVITY_SNAPSHOT',
      timestamp: 1781293057366,
      messageId: 'activity-dc19f4fd6e054e58baa471ef2fd5613a',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            beginRendering: {
              surfaceId: 'skeleton-surface-next-actions',
              root: 'skeleton-root-next-actions',
              catalogId: 'a2ui-surface',
            },
          },
          {
            surfaceUpdate: {
              surfaceId: 'skeleton-surface-next-actions',
              components: [
                {
                  id: 'skeleton-root-next-actions',
                  component: {
                    NextActionsBar: {
                      isLoading: true,
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      replace: true,
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_qkQi4iUnTHGyKsjuxb8zJd',
      delta:
        '{"actions": [{"text": "Show me popular products", "type": "followup"}, {"text": "sports equipment", "type": "search"}, {"text": "outdoor gear", "type": "search"}]}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_qkQi4iUnTHGyKsjuxb8zJd',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: '792dc936-e99d-46d0-8ab6-0b577ec8d3ab',
      toolCallId: 'tooluse_qkQi4iUnTHGyKsjuxb8zJd',
      content: '"NextActionsBar queued on surface \'next-actions-surface\' with 3 action(s)."',
    },
  },
  {
    event: 'message',
    data: {
      type: 'ACTIVITY_SNAPSHOT',
      timestamp: 1781293057815,
      messageId: 'activity-dc19f4fd6e054e58baa471ef2fd5613a',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            beginRendering: {
              surfaceId: 'next-actions-surface',
              root: 'root-next-actions-surface',
            },
          },
          {
            surfaceUpdate: {
              surfaceId: 'next-actions-surface',
              components: [
                {
                  id: 'root-next-actions-surface',
                  component: {
                    NextActionsBar: {
                      actions: {
                        componentId: 'button-next-actions-surface',
                        dataBinding: '/actions',
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            dataModelUpdate: {
              surfaceId: 'next-actions-surface',
              contents: [
                {
                  key: 'actions',
                  valueMap: [
                    {
                      valueMap: [
                        {
                          key: 'text',
                          valueString: 'Show me popular products',
                        },
                        {
                          key: 'type',
                          valueString: 'followup',
                        },
                      ],
                    },
                    {
                      valueMap: [
                        {
                          key: 'text',
                          valueString: 'sports equipment',
                        },
                        {
                          key: 'type',
                          valueString: 'search',
                        },
                      ],
                    },
                    {
                      valueMap: [
                        {
                          key: 'text',
                          valueString: 'outdoor gear',
                        },
                        {
                          key: 'type',
                          valueString: 'search',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      replace: true,
    },
  },
];

const response5Events: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents,
});

export {response5Events};
