import {describe, expect, it} from 'vitest';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine} from '../../../test/mock-engine-v2.js';
import {getAgentChatInitialState} from '../../../features/commerce/agent-chat/agent-chat-state.js';
import {buildAgentChatCatalog} from './headless-agent-chat-catalog.js';

describe('buildAgentChatCatalog', () => {
  it('derives activity and message catalog state from a2ui-surface activities', () => {
    const state = buildMockCommerceState();
    (
      state as unknown as {
        agentChat: ReturnType<typeof getAgentChatInitialState>;
      }
    ).agentChat = getAgentChatInitialState('thread-1');

    const operations = [
      {
        dataModelUpdate: {
          surfaceId: 'surface-products',
          contents: [
            {
              key: 'products',
              valueMap: [
                {
                  valueMap: [
                    {key: 'ec_product_id', valueString: 'sku-1'},
                    {key: 'ec_name', valueString: 'Product 1'},
                    {key: 'ec_brand', valueString: 'Brand'},
                    {key: 'ec_price', valueNumber: 25},
                    {key: 'ec_image', valueString: '/p1.png'},
                  ],
                },
              ],
            },
            {
              key: 'actions',
              valueMap: [
                {
                  valueMap: [
                    {key: 'text', valueString: 'Show alternatives'},
                    {key: 'type', valueString: 'followup'},
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        surfaceUpdate: {
          surfaceId: 'surface-products',
          components: [
            {
              component: {
                NextActionsBar: {
                  heading: {literalString: 'Suggested next steps'},
                },
              },
            },
          ],
        },
      },
    ];

    (
      state as unknown as {
        agentChat: ReturnType<typeof getAgentChatInitialState>;
      }
    ).agentChat.conversation.messages = [
      {
        id: 'message-1',
        role: 'assistant',
        content: '',
        progress: null,
        activities: [
          {
            id: 'activity-1',
            type: 'a2ui-surface',
            ownership: 'backend',
            data: {operations},
          },
        ],
      },
    ];

    const engine = buildMockCommerceEngine(
      state as Parameters<typeof buildMockCommerceEngine>[0]
    );

    const controller = buildAgentChatCatalog(engine);
    const activityState = controller.getActivity('activity-1');

    expect(activityState).not.toBeNull();
    expect(activityState?.messageId).toBe('message-1');
    expect(activityState?.hasNextActionsComponent).toBe(true);
    expect(activityState?.productsBySurface['surface-products']).toHaveLength(
      1
    );
    expect(activityState?.actionsBySurface['surface-products']).toEqual([
      {text: 'Show alternatives', type: 'followup'},
    ]);

    expect(controller.getMessageProductsBySurface('message-1')).toEqual({
      'surface-products': [
        {
          ec_product_id: 'sku-1',
          ec_name: 'Product 1',
          ec_brand: 'Brand',
          ec_price: 25,
          ec_image: '/p1.png',
        },
      ],
    });
  });

  it('ignores non a2ui-surface activities', () => {
    const state = buildMockCommerceState();
    (
      state as unknown as {
        agentChat: ReturnType<typeof getAgentChatInitialState>;
      }
    ).agentChat = getAgentChatInitialState('thread-1');

    (
      state as unknown as {
        agentChat: ReturnType<typeof getAgentChatInitialState>;
      }
    ).agentChat.conversation.messages = [
      {
        id: 'message-1',
        role: 'assistant',
        content: '',
        progress: null,
        activities: [
          {
            id: 'activity-1',
            type: 'other-activity',
            ownership: 'backend',
            data: {},
          },
        ],
      },
    ];

    const engine = buildMockCommerceEngine(
      state as Parameters<typeof buildMockCommerceEngine>[0]
    );

    const controller = buildAgentChatCatalog(engine);

    expect(controller.state.activities).toEqual({});
    expect(controller.state.messages).toEqual({});
    expect(controller.getActivity('activity-1')).toBeNull();
    expect(controller.getMessageProductsBySurface('message-1')).toEqual({});
  });
});
