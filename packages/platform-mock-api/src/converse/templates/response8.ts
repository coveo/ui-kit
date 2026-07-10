import {buildConversationResponse} from './shared.js';
import type {ConverseEvent} from '../events.js';

const runId = '462287cc-7b01-4030-b5f7-82c49fc124ea';

const middleEvents: ConverseEvent[] = [
  {
    event: 'message',
    data: {
      type: 'ACTIVITY_SNAPSHOT',
      timestamp: 1781801671147,
      messageId: 'activity-b8536af5a5d4421abf80cf44aa1ba0f4',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            beginRendering: {
              surfaceId: 'skeleton-surface-comparison',
              root: 'skeleton-root-comparison',
              catalogId: 'coveo-commerce-v1',
            },
          },
          {
            surfaceUpdate: {
              surfaceId: 'skeleton-surface-comparison',
              components: [
                {
                  id: 'skeleton-root-comparison',
                  component: {
                    ComparisonTable: {
                      heading: {
                        literalString: '',
                      },
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
      type: 'REASONING_START',
      messageId: 'reasoning-2eea3383-ef2b-4be0-bc42-37b095abec10',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: "I'll help you compare wetsuits",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: ' for cold-water surfing. Let',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: ' me search',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: ' for col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: 'd-water surfing wetsuits to',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: ' buil',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: 'd a',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: ' comparison set',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: ' for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
      delta: ' you.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: '2eea3383-ef2b-4be0-bc42-37b095abec10',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-2eea3383-ef2b-4be0-bc42-37b095abec10',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      toolCallName: 'coveo_commerce_search',
      parentMessageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: '{"que',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: 'ry": "',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: 'cold wa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: 'ter sur',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: 'fin',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: 'g wet',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: 'suits"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: ', "per_pa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      delta: 'ge": 20}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: 'ad6c8f12-9eed-42f3-9401-b1a22102c60a',
      toolCallId: 'tooluse_r9kp00zv31QQm3wZtFxQ19',
      content:
        '"products[19]{ec_product_id,ec_name,ec_price}:\\n  \\"gid://shopify/ProductVariant/50674633310482\\",Blue Wave Wetsuit - Blue / XXL,99.99\\n  \\"gid://shopify/ProductVariant/50674625773842\\",ZenSurf Full Suit - Red / L,299.99\\n  \\"gid://shopify/ProductVariant/50674584813842\\",Triathlete Pro Sleeveless Wetsuit - Black / M,99.99\\n  \\"gid://shopify/ProductVariant/50674590613778\\",WaveRider Shorty Wetsuit - Blue / M,129.99\\n  \\"gid://shopify/ProductVariant/50674583208210\\",Wave Rider Shorty Wetsuit - Yellow / XL,99.99\\n  \\"gid://shopify/ProductVariant/50674633900306\\",ThermoFlex Winter Wetsuit - Red / M,399.99\\n  \\"gid://shopify/ProductVariant/50674580193554\\",EcoFlex Performance Suit - Blue / XS,149.99\\n  \\"gid://shopify/ProductVariant/50674630951186\\",WaveGuard Performance Full Suit - Black / XXL,249.99\\n  \\"gid://shopify/ProductVariant/50674632917266\\",Triathlete WaveFlex Performance Suit - Gray / S,299.99\\n  \\"gid://shopify/ProductVariant/50674631704850\\",AquaShred Full Suit - Red / L,149.99\\n  \\"gid://shopify/ProductVariant/50674588320018\\",Wave Rider Shorty - Black / L,79.99\\n  \\"gid://shopify/ProductVariant/50674589729042\\",Kayak Thermal Guardian Suit - Gray / L,129.99\\n  \\"gid://shopify/ProductVariant/50674587009298\\",EcoWave Neoprene Shorty - Red / XXL,79.99\\n  \\"gid://shopify/ProductVariant/50674586222866\\",AquaGuard Beginner Swim Suit - Black / XS,199.99\\n  \\"gid://shopify/ProductVariant/50674587533586\\",ThermoFlex Kayak Suit - Black / XS,149.99\\n  \\"gid://shopify/ProductVariant/50674584256786\\",WaveRider Performance Suit - Black / S,129.99\\n  \\"gid://shopify/ProductVariant/50674627838226\\",EcoWave Thermal Suit - Blue / S,299.99\\n  \\"gid://shopify/ProductVariant/50674628428050\\",TideFlex Dive Suit - Gray / XL,399.99\\n  \\"gid://shopify/ProductVariant/50674583699730\\",AquaGlide Performance Suit - Gray / XL,79.99"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_START',
      messageId: 'reasoning-5d3f4cb7-59a2-4658-a749-438bce4fedbf',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'Goo',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'd results',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: '.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' Now let me get',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' detaile',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'd product',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' information for the top',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' candidates',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' that',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' are',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' best',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' suite',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'd for col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'd-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'water surf',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'ing.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' I',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: "'ll focus",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' on full',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' suits',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' and thermal',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' options',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' that',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' indicate',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: ' col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
      delta: 'd-water performance.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: '5d3f4cb7-59a2-4658-a749-438bce4fedbf',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-5d3f4cb7-59a2-4658-a749-438bce4fedbf',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      toolCallName: 'list_product_attributes',
      parentMessageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '{"produ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'ct_ids":',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: ' ["gid',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '://shopi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'fy/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'Pr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'oductVa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'riant/506746',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '339',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '00306",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '"gid://',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'shop',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'ify/ProductV',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'ariant/50674',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '6257738',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '42","gid://s',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'hopif',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'y/Pr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'oductVar',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: 'iant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '/5',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '067463095',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '118',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      delta: '6"]}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: 'cdee193b-f358-4351-bf5f-93144b93d45d',
      toolCallId: 'tooluse_yGXsqOMyjaVntzwiJch875',
      content:
        '"shared fields (gid://shopify/ProductVariant/50674633900306, gid://shopify/ProductVariant/50674625773842, gid://shopify/ProductVariant/50674630951186): ec_brand, ec_category, ec_color, ec_description, ec_gender, ec_images, ec_in_stock, ec_item_group_id, ec_name, ec_price, ec_product_id, ec_promo_price, ec_rating, ec_shortdesc, ec_thumbnails, excerpt, excerptHighlights"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_START',
      messageId: 'reasoning-450ff7f0-e81b-4003-8562-6a9207e6d8a9',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
      delta: 'Now',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
      delta: ' let me fetch',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
      delta: ' the full product details for these three',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
      delta: ' candidates',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
      delta: ':',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: '450ff7f0-e81b-4003-8562-6a9207e6d8a9',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-450ff7f0-e81b-4003-8562-6a9207e6d8a9',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      toolCallName: 'lookup_cached_products',
      parentMessageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '{"product_i',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ds',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '": ["gid://',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'shop',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ify/Produ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ctV',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ariant/5',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '06',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '746339',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '00306","gid',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '://sho',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'pify/Pr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'oduc',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'tV',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'arian',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 't/5067',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '4625',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '773842","gi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'd://',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'shopify/Pr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'odu',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ctVariant/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '5067',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '463',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '0951',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '186"]',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: ', "fields',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '": ["ec_p',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'roduct_i',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'd","ec_name"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: ',"ec_brand"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: ',"ec_pric',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'e","e',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'c_',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'descriptio',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'n","ec',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '_shortdesc",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '"ec_color",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: '"ec_im',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ages","',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ec_rating","',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'ec_',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: 'in_stock"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      delta: ']}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: 'f9ef5af3-1c59-46e9-91f4-2bcc2f77866d',
      toolCallId: 'tooluse_HLD87o5ce3ihzSIjXnTwhI',
      content:
        '"products[3]{ec_name,ec_description,ec_shortdesc,ec_brand,ec_price,ec_in_stock,ec_rating,ec_color}:\\n  ThermoFlex Winter Wetsuit - Red / M,\\"Conquer cold waters with the ThermoFlex Winter Wetsuit, designed specifically for paddleboarders who demand peak performance in frigid conditions. Crafted from high-quality nylon with a 7mm thickness, this wetsuit ensures optimal thermal insulation and long-lasting durability. Featuring ergonomic panels for unmatched flexibility and a sealed zip for extra protection, the ThermoFlex guarantees a snug fit and protects you against the elements. Enjoy peace of mind with its protective coating, double-lined seams, and low carbon manufacturing process. Certified as CE Compliant and T\\u00dcV Approved, this winter full suit promises safety and reliability, backed by a 3-year performance warranty. Whether you\'re tackling winter waves or enjoying chilly paddles, the ThermoFlex Winter Wetsuit delivers outstanding warmth and comfort every time. Available in bold red, this wetsuit combines style with high performance. Make every adventure count with the ThermoFlex Winter Wetsuit.RCWETF_D8E3\\",\\"Conquer cold waters with the ThermoFlex Winter Wetsuit, designed specifically for paddleboarders who demand peak performance in frigid conditions. Crafted from high-quality nylon with a 7mm thickness, this wetsuit ensures optimal thermal insulation and long-lasting durability. Featuring ergonomic panels for unmatched flexibility and a sealed zip for extra protection, the ThermoFlex guarantees a snug fit and protects you against the elements. Enjoy peace of mind with its protective coating, double-lined seams, and low carbon manufacturing process. Certified as CE Compliant and T\\u00dcV Approved, this winter full suit promises safety and reliability, backed by a 3-year performance warranty. Whether you\'re tackling winter waves or enjoying chilly paddles, the ThermoFlex Winter Wetsuit delivers outstanding warmth and comfort every time. Available in bold red, this wetsuit combines style with high performance. Make every adventure count with the ThermoFlex Winter Wetsuit.RCWETF_D8E3\\",Rip Curl,399.99,true,3.6,Red\\n  ZenSurf Full Suit - Red / L,\\"Experience the ultimate wave-riding adventure with ZenSurf Full Suit. Designed specifically for men who love surfing, this wetsuit offers unmatched performance in cold water. Crafted from durable, sustainable Neoprene material, it features ergonomic panels for enhanced flexibility and smooth stitching for added safety. Available in striking Black, Blue, and Red colors, each wetsuit comes with a back zip for easy wear. Engineered for long-lasting use, the suit also includes blindstitched seams for superior thermal protection. Enjoy the convenience of a travel-friendly carry bag and a repair patch, all backed by a 3-year performance warranty. Whether you\'re riding icy waves or paddling out on a chilly day, the ZenSurf Full Suit ensures optimal comfort and protection, making it your ideal surfing companion.ONWETF_7384\\",\\"Experience the ultimate wave-riding adventure with ZenSurf Full Suit. Designed specifically for men who love surfing, this wetsuit offers unmatched performance in cold water. Crafted from durable, sustainable Neoprene material, it features ergonomic panels for enhanced flexibility and smooth stitching for added safety. Available in striking Black, Blue, and Red colors, each wetsuit comes with a back zip for easy wear. Engineered for long-lasting use, the suit also includes blindstitched seams for superior thermal protection. Enjoy the convenience of a travel-friendly carry bag and a repair patch, all backed by a 3-year performance warranty. Whether you\'re riding icy waves or paddling out on a chilly day, the ZenSurf Full Suit ensures optimal comfort and protection, making it your ideal surfing companion.ONWETF_7384\\",O\'Neill,299.99,true,4.5,Red\\n  WaveGuard Performance Full Suit - Black / XXL,\\"Experience the ultimate surfing adventure with the WaveGuard Performance Full Suit. Designed for surfers who demand the best, this wetsuit combines high stretch neoprene for unmatched flexibility and a heat-retaining lining to keep you warm in cold waters. Available in sleek black or stylish blue, the chest zip ensures easy access while the protective coating and welded seams provide exceptional durability and tear resistance. Made from eco-friendly materials, it includes a carry bag and hanger for convenient portability. With ISO certification and UV resistance, the WaveGuard Full Suit is your perfect companion for every surf session. Enjoy peace of mind with a lifetime seam warranty and superior performance in every wave.ONWETF_C792\\",\\"Experience the ultimate surfing adventure with the WaveGuard Performance Full Suit. Designed for surfers who demand the best, this wetsuit combines high stretch neoprene for unmatched flexibility and a heat-retaining lining to keep you warm in cold waters. Available in sleek black or stylish blue, the chest zip ensures easy access while the protective coating and welded seams provide exceptional durability and tear resistance. Made from eco-friendly materials, it includes a carry bag and hanger for convenient portability. With ISO certification and UV resistance, the WaveGuard Full Suit is your perfect companion for every surf session. Enjoy peace of mind with a lifetime seam warranty and superior performance in every wave.ONWETF_C792\\",O\'Neill,249.99,true,4.9,Black"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_START',
      messageId: 'reasoning-af0ff75e-0780-4742-8b7a-752101758ad2',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: 'Perfect',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: '! I have',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' three',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' strong',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' candidates for col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: 'd-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: 'water surfing w',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: 'etsuits. Let me get',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' the image',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' URLs',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' so',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' I can properly',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' register',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' an',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: 'd render',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
      delta: ' them:',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: 'af0ff75e-0780-4742-8b7a-752101758ad2',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-af0ff75e-0780-4742-8b7a-752101758ad2',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      toolCallName: 'lookup_cached_products',
      parentMessageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '{"fi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'elds"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: ': ["ec_p',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'roduct_i',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'd","ec',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '_name","ec_',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'bran',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'd","ec',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '_pri',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'ce","e',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'c_image","cl',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'ickU',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'ri"]',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: ', "product',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '_ids": ["gid',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '://',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'shopify/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'Produc',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'tVariant/5',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '067463390030',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '6","g',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'id://shopif',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'y/P',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'rodu',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'ct',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'Variant/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '5067462',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '5773842"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: ',"gid://shop',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'if',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'y/ProductV',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'aria',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: 'nt/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '50',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '674630951',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      delta: '186"]}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: 'daa8bb11-67e4-47cb-917c-d49c39e24447',
      toolCallId: 'tooluse_vatAcKnofijYCspMf5zxqe',
      content:
        '"products[3]{ec_name,ec_brand,ec_price}:\\n  ThermoFlex Winter Wetsuit - Red / M,Rip Curl,399.99\\n  ZenSurf Full Suit - Red / L,O\'Neill,299.99\\n  WaveGuard Performance Full Suit - Black / XXL,O\'Neill,249.99"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_START',
      messageId: 'reasoning-0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      delta: 'Now let me register',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      delta: ' these three wetsuits an',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      delta: 'd create',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      delta: ' a comparison',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      delta: ' render',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      delta: ' plan',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
      delta: ':',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: '0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-0ecbd453-3fa3-481b-86a7-cc6d27c4a331',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      toolCallName: 'register_products',
      parentMessageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '{"products":',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ' [{"ec_p',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'roduct_id":"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'gid://sho',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'pify/Produc',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'tV',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ar',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'iant/50674',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '6339003',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '06","ec_nam',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'e":"Thermo',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'Flex Wint',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'er Wetsuit',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ' - Red',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ' / M","ec_br',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'and":"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'Rip Cu',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'rl","e',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'c_price":3',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '99.99,"ec_i',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'mage":"http',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 's://cdn.sho',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'pify.c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'om/s/files',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '/1/000',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '0/0001/prod',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ucts/therm',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'oflexwinte',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'r.jpg",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '"clickU',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ri',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '":"htt',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ps://s',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'hop.example.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'com/products',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '/thermo',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'flexw',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'inter"},{"e',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'c_product_id',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '":"gid://sh',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'opify/Produ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ctVariant/5',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '067462',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '5773',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '842","ec_n',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ame":"Zen',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'Surf ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'Full Su',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'it - Red',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ' / L","e',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'c_bran',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'd":"O\'Neill"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ',"ec_pric',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'e"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ':299.99,',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '"ec_image":"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'http',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 's://cd',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'n.shopi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'fy.com/s/fil',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'es/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '1/0000/0001',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '/product',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 's/zen',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'surf.jpg"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ',"c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'lickUri":"h',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ttps://shop.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'example.c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'om/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'products/z',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ensu',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'rf"},',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '{"ec_produc',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 't_id":"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'gid://s',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'hopi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'fy/Produ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ct',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'Va',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'riant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '/50674630951',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '186","ec_nam',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'e":"WaveGua',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'rd Per',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'formance F',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ull',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ' Suit - ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'Black / XX',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'L","ec_bran',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'd":"O\'Neill',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '"e',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'c_pri',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ce":',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '249.99,',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '"ec_image":',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '"http',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 's://cdn',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '.sh',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'opify.com/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 's/files/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '1/0000/0001/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'pro',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'ducts',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '/waveg',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'uard.jpg"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ',"clickUri"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: ':"ht',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'tps://',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'shop.exampl',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'e.com/p',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'roducts',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '/waveg',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: 'uard',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      delta: '"}]}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: '566c113d-38a5-49e9-8b45-b931b0b74716',
      toolCallId: 'tooluse_BHYyPxr3ZfjcEBak88JoFB',
      content: '"Registered 3 product(s) for reuse."',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_START',
      messageId: 'reasoning-ddf7fb0a-8973-4129-9f60-15ff5a30e656',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
      delta: 'Now',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
      delta: ' I',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
      delta: "'ll create an",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
      delta: 'd store',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
      delta: ' the comparison render',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
      delta: ' plan:',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: 'ddf7fb0a-8973-4129-9f60-15ff5a30e656',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-ddf7fb0a-8973-4129-9f60-15ff5a30e656',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      toolCallName: 'store_render_plan',
      parentMessageId: '0945b047-8dfe-43df-8499-c277240bc90c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '{"r',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'oute"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ': "c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'om',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'pariso',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'n"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ', "render_un',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'its"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ': [{',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"unit_type"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ':"comparison',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '_table',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '","group_k',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ey"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ':"coldwater_',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'we',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tsuits_compa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rison","pr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'oduct_refs',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '":["gid://',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'shopify/Pro',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ductV',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'aria',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'nt/50674',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '63',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '3900306"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ',"gid:/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '/shopi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'fy',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '/ProductV',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ariant/506',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '746',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '25773842",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"g',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'id://shopify',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '/Pro',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ductVariant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '/506746309',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '51186"],"sou',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rce_sea',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rch_r',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ef":"coldw',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ater_surfing',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '_wetsuits_',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'sea',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rch",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"or',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'dering":"cu',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rat',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ed",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"metadata"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ':{"annota',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tions',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '":{"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'gid://shop',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ify/',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ProductVari',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ant/5',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '067463',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '390030',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '6":{"standou',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 't":"7mm neo',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'prene t',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'hickness wit',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'h seal',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ed zip for m',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'axi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'mum therma',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'l insula',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tion in cold',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' w',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ater","trad',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'e_',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'off":"High',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'est p',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ri',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ce at',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' $399.99, ta',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rgete',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'd for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' p',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'addle',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'boarders",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"best_fo',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'r":"Extre',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'me c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'old-water ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'conditions',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' requiring',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' peak wa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rmth"}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ',"gid:',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '//sho',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'pify/Pr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'oductVariant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '/506746257',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '73842":{"s',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tandout',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '":',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"Su',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'st',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ainable n',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'eoprene wit',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'h bl',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'indstit',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ched seams ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'for superio',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'r thermal p',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rot',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ect',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ion and flex',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ibility",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"tr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ade_',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'off":"Mi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'd-rang',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'e price w',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ith ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'excel',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'lent ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'value","b',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'est_fo',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'r":"Cold-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'water',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' su',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rfing wi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'th premium ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'comfort a',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'nd envir',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'onmental',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' consciousn',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ess"},"gid',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '://shopify',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '/Pr',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'oductVaria',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'nt/506746',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '30',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '951186":{"st',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'andout":',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"Heat-retai',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ning lining ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' high-st',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'retch neopre',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ne and li',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'fetime sea',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'm warranty',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '; best r',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ating at 4',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '.9 stars",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"trade_off',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '":"Most ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'affordabl',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'e option',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' at $249.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '99"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ',"best',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '_f',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'or":"C',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'old-water',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' surfin',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'g with du',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rabilit',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'y ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'and value ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'for freq',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'uent surfer',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 's"}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '},"summ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ary_tex',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 't":"Al',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'l three we',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tsuits a',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 're ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'fu',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'll',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' suits desig',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ned for cold',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '-wa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ter perf',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ormance',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' wi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'th neop',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rene',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' constructi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'on a',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'nd',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' t',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'herma',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'l protection',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '. The',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' T',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'hermoFlex Wi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'nter Wetsui',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 't offe',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rs m',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'aximum w',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'arm',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'th w',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ith its 7mm ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'thickness an',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'd sealed ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'zip, i',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'deal for ex',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'treme condi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tion',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 's. The ZenS',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'urf Full Sui',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 't balances s',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ustainabili',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ty an',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'd bli',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ndst',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'itched therm',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'al se',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ams at ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'a mid',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '-ran',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ge price.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' The ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'WaveG',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'uard ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'Pe',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rforman',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ce ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'Full Suit ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'deliv',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ers ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'the',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' best',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' value',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' with a hea',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 't-retainin',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'g lining, h',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ighest',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' customer ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'rat',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ing ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '(4.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '9 stars), ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'and lif',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'etime seam ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'warrantyâ€”ma',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'king it t',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'he s',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tro',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ngest choi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ce for cold',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '-water',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' surfing unl',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ess y',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'ou n',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'eed the',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ' extre',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'me ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'insula',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'tion of the ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'thi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'cker ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'Th',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'erm',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: 'oFlex.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: '"}}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      delta: ']}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'STATE_SNAPSHOT',
      snapshot: {
        commerce_render_plan: {
          route: 'comparison',
          render_units: [
            {
              unit_type: 'comparison_table',
              group_key: 'coldwater_wetsuits_comparison',
              product_refs: [
                'gid://shopify/ProductVariant/50674633900306',
                'gid://shopify/ProductVariant/50674625773842',
                'gid://shopify/ProductVariant/50674630951186',
              ],
              source_search_ref: 'coldwater_surfing_wetsuits_search',
              ordering: 'curated',
              metadata: {
                annotations: {
                  'gid://shopify/ProductVariant/50674633900306': {
                    standout:
                      '7mm neoprene thickness with sealed zip for maximum thermal insulation in cold water',
                    trade_off:
                      'Highest price at $399.99, targeted for paddleboarders',
                    best_for:
                      'Extreme cold-water conditions requiring peak warmth',
                  },
                  'gid://shopify/ProductVariant/50674625773842': {
                    standout:
                      'Sustainable neoprene with blindstitched seams for superior thermal protection and flexibility',
                    trade_off: 'Mid-range price with excellent value',
                    best_for:
                      'Cold-water surfing with premium comfort and environmental consciousness',
                  },
                  'gid://shopify/ProductVariant/50674630951186': {
                    standout:
                      'Heat-retaining lining with high-stretch neoprene and lifetime seam warranty; best rating at 4.9 stars',
                    trade_off: 'Most affordable option at $249.99',
                    best_for:
                      'Cold-water surfing with durability and value for frequent surfers',
                  },
                },
                summary_text:
                  'All three wetsuits are full suits designed for cold-water performance with neoprene construction and thermal protection. The ThermoFlex Winter Wetsuit offers maximum warmth with its 7mm thickness and sealed zip, ideal for extreme conditions. The ZenSurf Full Suit balances sustainability and blindstitched thermal seams at a mid-range price. The WaveGuard Performance Full Suit delivers the best value with a heat-retaining lining, highest customer rating (4.9 stars), and lifetime seam warrantyâ€”making it the strongest choice for cold-water surfing unless you need the extreme insulation of the thicker ThermoFlex.',
              },
            },
          ],
        },
      },
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: 'b04ac841-eeaa-4d57-b2b9-d97d6e87e2b0',
      toolCallId: 'tooluse_8K4S9jpPMlBcUlrhtmITf8',
      content:
        '"Stored render plan for route \'comparison\' with 1 render unit(s)."',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_START',
      messageId: 'reasoning-0945b047-8dfe-43df-8499-c277240bc90c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      delta: 'Now',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      delta: " I'll route",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      delta: ' to',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      delta: ' render',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      delta: ' to',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      delta: ' display',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
      delta: ' the comparison:',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: '0945b047-8dfe-43df-8499-c277240bc90c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-0945b047-8dfe-43df-8499-c277240bc90c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_START',
      messageId: 'reasoning-fc8dd193-ed8a-4c33-af59-3db2578c1024',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_START',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      role: 'reasoning',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'Perfect',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: "! I've prepare",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'd a',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' comparison',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' of three',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' excellent',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'd-water surfing wetsuits:',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '\n\n## Col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'd-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'Water Surfing Wetsuits',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' Comparison\n\n**',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'T',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'hermoFlex Winter Wetsuit',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' (',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'R',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'ip',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' Curl)',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' - $399.99**\n-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' 7mm n',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'eoprene thickness with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' sealed zip for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' maximum thermal',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' insulation\n- Best',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' extreme',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' cold-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'water conditions\n- Certifie',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'd CE',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' Compl',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'iant an',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'd T',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'ÃœV Approve',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'd with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '3',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '-year warranty',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '\n\n**ZenSurf Full',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' Suit (',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'O',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: "'Neill) - $299",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '.99**\n- Sustainable',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' neoprene with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' blin',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'dstitched se',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'ams for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' superior',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' thermal protection\n- Great',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' flexibility',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' and comfort for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'd-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'water surfing\n- Includes',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' travel',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' carry',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' bag and repair',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' patch',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '\n\n**WaveGuard Performance Full',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' Suit (O',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: "'Neill) - $249",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '.99**\n- Heat-ret',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'aining lining with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' high',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '-stretch',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' neoprene for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' flexibility',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: '\n- Highest customer rating at',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' 4.9 stars\n-',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' Best',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' value with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' lifetime seam warranty\n\n**Our',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' Recommendation:**',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' The W',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'aveGuard Performance Full Suit offers',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' the best overall',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' value for cold-water surfing with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' excellent',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' thermal protection, flexibility',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ', and the',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' highest customer satisfaction',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' ratingâ€”',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'unless',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: " you're",
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' facing',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' extreme conditions',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ',',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' in which case the th',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'icker ThermoFlex provides',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' maximum',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: ' warm',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
      delta: 'th.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_MESSAGE_END',
      messageId: 'fc8dd193-ed8a-4c33-af59-3db2578c1024',
    },
  },
  {
    event: 'message',
    data: {
      type: 'REASONING_END',
      messageId: 'reasoning-fc8dd193-ed8a-4c33-af59-3db2578c1024',
    },
  },
  {
    event: 'message',
    data: {
      type: 'STATE_SNAPSHOT',
      snapshot: {
        commerce_render_plan: {
          route: 'comparison',
          render_units: [
            {
              unit_type: 'comparison_table',
              group_key: 'coldwater_wetsuits_comparison',
              product_refs: [
                'gid://shopify/ProductVariant/50674633900306',
                'gid://shopify/ProductVariant/50674625773842',
                'gid://shopify/ProductVariant/50674630951186',
              ],
              source_search_ref: 'coldwater_surfing_wetsuits_search',
              ordering: 'curated',
              metadata: {
                annotations: {
                  'gid://shopify/ProductVariant/50674633900306': {
                    standout:
                      '7mm neoprene thickness with sealed zip for maximum thermal insulation in cold water',
                    trade_off:
                      'Highest price at $399.99, targeted for paddleboarders',
                    best_for:
                      'Extreme cold-water conditions requiring peak warmth',
                  },
                  'gid://shopify/ProductVariant/50674625773842': {
                    standout:
                      'Sustainable neoprene with blindstitched seams for superior thermal protection and flexibility',
                    trade_off: 'Mid-range price with excellent value',
                    best_for:
                      'Cold-water surfing with premium comfort and environmental consciousness',
                  },
                  'gid://shopify/ProductVariant/50674630951186': {
                    standout:
                      'Heat-retaining lining with high-stretch neoprene and lifetime seam warranty; best rating at 4.9 stars',
                    trade_off: 'Most affordable option at $249.99',
                    best_for:
                      'Cold-water surfing with durability and value for frequent surfers',
                  },
                },
                summary_text:
                  'All three wetsuits are full suits designed for cold-water performance with neoprene construction and thermal protection. The ThermoFlex Winter Wetsuit offers maximum warmth with its 7mm thickness and sealed zip, ideal for extreme conditions. The ZenSurf Full Suit balances sustainability and blindstitched thermal seams at a mid-range price. The WaveGuard Performance Full Suit delivers the best value with a heat-retaining lining, highest customer rating (4.9 stars), and lifetime seam warrantyâ€”making it the strongest choice for cold-water surfing unless you need the extreme insulation of the thicker ThermoFlex.',
              },
            },
          ],
        },
      },
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'det-33ae94c8288b',
      toolCallName: 'render_comparison_table',
    },
  },
  {
    event: 'message',
    data: {
      type: 'ACTIVITY_SNAPSHOT',
      timestamp: 1781801693907,
      messageId: 'activity-b8536af5a5d4421abf80cf44aa1ba0f4',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            beginRendering: {
              surfaceId: 'comparison-surface',
              root: 'root-comparison-surface',
              catalogId: 'coveo-commerce-v1',
            },
          },
          {
            surfaceUpdate: {
              surfaceId: 'comparison-surface',
              components: [
                {
                  id: 'root-comparison-surface',
                  component: {
                    ComparisonTable: {
                      heading: {
                        literalString: 'Comparison',
                      },
                      products: {
                        componentId: 'comparison-card-comparison-surface',
                        dataBinding: '/items',
                      },
                      attributes: ['standout', 'trade_off', 'best_for'],
                    },
                  },
                },
                {
                  id: 'comparison-card-comparison-surface',
                  component: {
                    ProductCard: {
                      ec_product_id: {
                        path: 'ec_product_id',
                      },
                      ec_name: {
                        path: 'ec_name',
                      },
                      ec_brand: {
                        path: 'ec_brand',
                      },
                      ec_image: {
                        path: 'ec_image',
                      },
                      ec_price: {
                        path: 'ec_price',
                      },
                      ec_promo_price: {
                        path: 'ec_promo_price',
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            beginRendering: {
              surfaceId: 'comparison-summary-surface',
              root: 'root-comparison-summary-surface',
              catalogId: 'coveo-commerce-v1',
            },
          },
          {
            surfaceUpdate: {
              surfaceId: 'comparison-summary-surface',
              components: [
                {
                  id: 'root-comparison-summary-surface',
                  component: {
                    ComparisonSummary: {
                      text: {
                        literalString:
                          'All three wetsuits are full suits designed for cold-water performance with neoprene construction and thermal protection. The ThermoFlex Winter Wetsuit offers maximum warmth with its 7mm thickness and sealed zip, ideal for extreme conditions. The ZenSurf Full Suit balances sustainability and blindstitched thermal seams at a mid-range price. The WaveGuard Performance Full Suit delivers the best value with a heat-retaining lining, highest customer rating (4.9 stars), and lifetime seam warrantyâ€”making it the strongest choice for cold-water surfing unless you need the extreme insulation of the thicker ThermoFlex.',
                      },
                    },
                  },
                },
              ],
            },
          },
          {
            dataModelUpdate: {
              surfaceId: 'comparison-surface',
              contents: [
                {
                  key: 'items',
                  valueMap: [
                    {
                      key: '0',
                      valueMap: [
                        {
                          key: 'ec_name',
                          valueString: 'ThermoFlex Winter Wetsuit - Red / M',
                        },
                        {
                          key: 'ec_brand',
                          valueString: 'Rip Curl',
                        },
                        {
                          key: 'ec_price',
                          valueNumber: 399.99,
                        },
                        {
                          key: 'ec_promo_price',
                          valueNumber: 399.99,
                        },
                        {
                          key: 'ec_image',
                          valueString:
                            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/8c6d80ac5b9b_bottom_left_852e0a5c-9b08-43bd-a6e5-67ec90d5d6f2.webp?v=1766164226',
                        },
                        {
                          key: 'ec_product_id',
                          valueString:
                            'gid://shopify/ProductVariant/50674633900306',
                        },
                        {
                          key: 'ec_description',
                          valueString:
                            "Conquer cold waters with the ThermoFlex Winter Wetsuit, designed specifically for paddleboarders who demand peak performance in frigid conditions. Crafted from high-quality nylon with a 7mm thickness, this wetsuit ensures optimal thermal insulation and long-lasting durability. Featuring ergonomic panels for unmatched flexibility and a sealed zip for extra protection, the ThermoFlex guarantees a snug fit and protects you against the elements. Enjoy peace of mind with its protective coating, double-lined seams, and low carbon manufacturing process. Certified as CE Compliant and TÃœV Approved, this winter full suit promises safety and reliability, backed by a 3-year performance warranty. Whether you're tackling winter waves or enjoying chilly paddles, the ThermoFlex Winter Wetsuit delivers outstanding warmth and comfort every time. Available in bold red, this wetsuit combines style with high performance. Make every adventure count with the ThermoFlex Winter Wetsuit.RCWETF_D8E3",
                        },
                        {
                          key: 'ec_category',
                          valueString: 'Wetsuits',
                        },
                        {
                          key: 'ec_rating',
                          valueNumber: 3.6,
                        },
                        {
                          key: 'clickUri',
                          valueString: '/products/rcwetf_d8e3',
                        },
                        {
                          key: 'resultType',
                          valueString: 'product',
                        },
                        {
                          key: 'queryPinned',
                          valueString: 'false',
                        },
                        {
                          key: 'ec_shortdesc',
                          valueString:
                            "Conquer cold waters with the ThermoFlex Winter Wetsuit, designed specifically for paddleboarders who demand peak performance in frigid conditions. Crafted from high-quality nylon with a 7mm thickness, this wetsuit ensures optimal thermal insulation and long-lasting durability. Featuring ergonomic panels for unmatched flexibility and a sealed zip for extra protection, the ThermoFlex guarantees a snug fit and protects you against the elements. Enjoy peace of mind with its protective coating, double-lined seams, and low carbon manufacturing process. Certified as CE Compliant and TÃœV Approved, this winter full suit promises safety and reliability, backed by a 3-year performance warranty. Whether you're tackling winter waves or enjoying chilly paddles, the ThermoFlex Winter Wetsuit delivers outstanding warmth and comfort every time. Available in bold red, this wetsuit combines style with high performance. Make every adventure count with the ThermoFlex Winter Wetsuit.RCWETF_D8E3",
                        },
                        {
                          key: 'ec_in_stock',
                          valueString: 'true',
                        },
                        {
                          key: 'ec_item_group_id',
                          valueString: '9932584452370',
                        },
                        {
                          key: 'ec_gender',
                          valueString: 'Men',
                        },
                        {
                          key: 'ec_color',
                          valueString: 'Red',
                        },
                        {
                          key: 'permanentid',
                          valueString:
                            'gid://shopify/ProductVariant/50674633900306',
                        },
                        {
                          key: 'excerpt',
                          valueString:
                            'Conquer cold waters with the ThermoFlex Winter Wetsuit, designed specifically for paddleboarders who ... nylon with a 7mm thickness, this wetsuit ensures optimal thermal insulation and long- ...',
                        },
                        {
                          key: 'totalNumberOfChildren',
                          valueNumber: 6,
                        },
                        {
                          key: 'standout',
                          valueString:
                            '7mm neoprene thickness with sealed zip for maximum thermal insulation in cold water',
                        },
                        {
                          key: 'trade_off',
                          valueString:
                            'Highest price at $399.99, targeted for paddleboarders',
                        },
                        {
                          key: 'best_for',
                          valueString:
                            'Extreme cold-water conditions requiring peak warmth',
                        },
                      ],
                    },
                    {
                      key: '1',
                      valueMap: [
                        {
                          key: 'ec_name',
                          valueString: 'ZenSurf Full Suit - Red / L',
                        },
                        {
                          key: 'ec_brand',
                          valueString: "O'Neill",
                        },
                        {
                          key: 'ec_price',
                          valueNumber: 299.99,
                        },
                        {
                          key: 'ec_promo_price',
                          valueNumber: 299.99,
                        },
                        {
                          key: 'ec_image',
                          valueString:
                            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/8d486fbcd37e_bottom_right_9f239b34-f80a-43d9-8d3a-4db4185b6ce3.webp?v=1766164198',
                        },
                        {
                          key: 'ec_product_id',
                          valueString:
                            'gid://shopify/ProductVariant/50674625773842',
                        },
                        {
                          key: 'ec_description',
                          valueString:
                            "Experience the ultimate wave-riding adventure with ZenSurf Full Suit. Designed specifically for men who love surfing, this wetsuit offers unmatched performance in cold water. Crafted from durable, sustainable Neoprene material, it features ergonomic panels for enhanced flexibility and smooth stitching for added safety. Available in striking Black, Blue, and Red colors, each wetsuit comes with a back zip for easy wear. Engineered for long-lasting use, the suit also includes blindstitched seams for superior thermal protection. Enjoy the convenience of a travel-friendly carry bag and a repair patch, all backed by a 3-year performance warranty. Whether you're riding icy waves or paddling out on a chilly day, the ZenSurf Full Suit ensures optimal comfort and protection, making it your ideal surfing companion.ONWETF_7384",
                        },
                        {
                          key: 'ec_category',
                          valueString: 'Wetsuits',
                        },
                        {
                          key: 'ec_rating',
                          valueNumber: 4.5,
                        },
                        {
                          key: 'clickUri',
                          valueString: '/products/onwetf_7384',
                        },
                        {
                          key: 'resultType',
                          valueString: 'product',
                        },
                        {
                          key: 'queryPinned',
                          valueString: 'false',
                        },
                        {
                          key: 'ec_shortdesc',
                          valueString:
                            "Experience the ultimate wave-riding adventure with ZenSurf Full Suit. Designed specifically for men who love surfing, this wetsuit offers unmatched performance in cold water. Crafted from durable, sustainable Neoprene material, it features ergonomic panels for enhanced flexibility and smooth stitching for added safety. Available in striking Black, Blue, and Red colors, each wetsuit comes with a back zip for easy wear. Engineered for long-lasting use, the suit also includes blindstitched seams for superior thermal protection. Enjoy the convenience of a travel-friendly carry bag and a repair patch, all backed by a 3-year performance warranty. Whether you're riding icy waves or paddling out on a chilly day, the ZenSurf Full Suit ensures optimal comfort and protection, making it your ideal surfing companion.ONWETF_7384",
                        },
                        {
                          key: 'ec_in_stock',
                          valueString: 'true',
                        },
                        {
                          key: 'ec_item_group_id',
                          valueString: '9934144831762',
                        },
                        {
                          key: 'ec_gender',
                          valueString: 'Men',
                        },
                        {
                          key: 'ec_color',
                          valueString: 'Red',
                        },
                        {
                          key: 'permanentid',
                          valueString:
                            'gid://shopify/ProductVariant/50674625773842',
                        },
                        {
                          key: 'excerpt',
                          valueString:
                            'Designed specifically for men who love surfing, this wetsuit offers unmatched performance in cold water. ... optimal comfort and protection, making it your ideal surfing companion.ONWETF_7384',
                        },
                        {
                          key: 'totalNumberOfChildren',
                          valueNumber: 18,
                        },
                        {
                          key: 'standout',
                          valueString:
                            'Sustainable neoprene with blindstitched seams for superior thermal protection and flexibility',
                        },
                        {
                          key: 'trade_off',
                          valueString: 'Mid-range price with excellent value',
                        },
                        {
                          key: 'best_for',
                          valueString:
                            'Cold-water surfing with premium comfort and environmental consciousness',
                        },
                      ],
                    },
                    {
                      key: '2',
                      valueMap: [
                        {
                          key: 'ec_name',
                          valueString:
                            'WaveGuard Performance Full Suit - Black / XXL',
                        },
                        {
                          key: 'ec_brand',
                          valueString: "O'Neill",
                        },
                        {
                          key: 'ec_price',
                          valueNumber: 249.99,
                        },
                        {
                          key: 'ec_promo_price',
                          valueNumber: 249.99,
                        },
                        {
                          key: 'ec_image',
                          valueString:
                            'https://cdn.shopify.com/s/files/1/0910/6502/4786/files/a1cd999bd5d3_bottom_left.webp?v=1766164216',
                        },
                        {
                          key: 'ec_product_id',
                          valueString:
                            'gid://shopify/ProductVariant/50674630951186',
                        },
                        {
                          key: 'ec_description',
                          valueString:
                            'Experience the ultimate surfing adventure with the WaveGuard Performance Full Suit. Designed for surfers who demand the best, this wetsuit combines high stretch neoprene for unmatched flexibility and a heat-retaining lining to keep you warm in cold waters. Available in sleek black or stylish blue, the chest zip ensures easy access while the protective coating and welded seams provide exceptional durability and tear resistance. Made from eco-friendly materials, it includes a carry bag and hanger for convenient portability. With ISO certification and UV resistance, the WaveGuard Full Suit is your perfect companion for every surf session. Enjoy peace of mind with a lifetime seam warranty and superior performance in every wave.ONWETF_C792',
                        },
                        {
                          key: 'ec_category',
                          valueString: 'Wetsuits',
                        },
                        {
                          key: 'ec_rating',
                          valueNumber: 4.9,
                        },
                        {
                          key: 'clickUri',
                          valueString: '/products/onwetf_c792',
                        },
                        {
                          key: 'resultType',
                          valueString: 'product',
                        },
                        {
                          key: 'queryPinned',
                          valueString: 'false',
                        },
                        {
                          key: 'ec_shortdesc',
                          valueString:
                            'Experience the ultimate surfing adventure with the WaveGuard Performance Full Suit. Designed for surfers who demand the best, this wetsuit combines high stretch neoprene for unmatched flexibility and a heat-retaining lining to keep you warm in cold waters. Available in sleek black or stylish blue, the chest zip ensures easy access while the protective coating and welded seams provide exceptional durability and tear resistance. Made from eco-friendly materials, it includes a carry bag and hanger for convenient portability. With ISO certification and UV resistance, the WaveGuard Full Suit is your perfect companion for every surf session. Enjoy peace of mind with a lifetime seam warranty and superior performance in every wave.ONWETF_C792',
                        },
                        {
                          key: 'ec_in_stock',
                          valueString: 'true',
                        },
                        {
                          key: 'ec_item_group_id',
                          valueString: '9934145487122',
                        },
                        {
                          key: 'ec_gender',
                          valueString: 'Men',
                        },
                        {
                          key: 'ec_color',
                          valueString: 'Black',
                        },
                        {
                          key: 'permanentid',
                          valueString:
                            'gid://shopify/ProductVariant/50674630951186',
                        },
                        {
                          key: 'excerpt',
                          valueString:
                            'Experience the ultimate surfing adventure with the WaveGuard Performance Full Suit. ... stretch neoprene for unmatched flexibility and a heat-retaining lining to keep you warm in cold waters.',
                        },
                        {
                          key: 'totalNumberOfChildren',
                          valueNumber: 12,
                        },
                        {
                          key: 'standout',
                          valueString:
                            'Heat-retaining lining with high-stretch neoprene and lifetime seam warranty; best rating at 4.9 stars',
                        },
                        {
                          key: 'trade_off',
                          valueString: 'Most affordable option at $249.99',
                        },
                        {
                          key: 'best_for',
                          valueString:
                            'Cold-water surfing with durability and value for frequent surfers',
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
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'det-33ae94c8288b',
      delta:
        '{"surface_id": "comparison-surface", "heading": "Comparison", "products": [{"ec_product_id": "gid://shopify/ProductVariant/50674633900306", "standout": "7mm neoprene thickness with sealed zip for maximum thermal insulation in cold water", "trade_off": "Highest price at $399.99, targeted for paddleboarders", "best_for": "Extreme cold-water conditions requiring peak warmth"}, {"ec_product_id": "gid://shopify/ProductVariant/50674625773842", "standout": "Sustainable neoprene with blindstitched seams for superior thermal protection and flexibility", "trade_off": "Mid-range price with excellent value", "best_for": "Cold-water surfing with premium comfort and environmental consciousness"}, {"ec_product_id": "gid://shopify/ProductVariant/50674630951186", "standout": "Heat-retaining lining with high-stretch neoprene and lifetime seam warranty; best rating at 4.9 stars", "trade_off": "Most affordable option at $249.99", "best_for": "Cold-water surfing with durability and value for frequent surfers"}]}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'det-33ae94c8288b',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_START',
      toolCallId: 'det-3f80c0bc1a90',
      toolCallName: 'render_comparison_summary',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'det-3f80c0bc1a90',
      delta:
        '{"text": "All three wetsuits are full suits designed for cold-water performance with neoprene construction and thermal protection. The ThermoFlex Winter Wetsuit offers maximum warmth with its 7mm thickness and sealed zip, ideal for extreme conditions. The ZenSurf Full Suit balances sustainability and blindstitched thermal seams at a mid-range price. The WaveGuard Performance Full Suit delivers the best value with a heat-retaining lining, highest customer rating (4.9 stars), and lifetime seam warranty\\u2014making it the strongest choice for cold-water surfing unless you need the extreme insulation of the thicker ThermoFlex."}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'det-3f80c0bc1a90',
    },
  },
  {
    event: 'message',
    data: {
      type: 'ACTIVITY_SNAPSHOT',
      timestamp: 1781801694770,
      messageId: 'activity-eef5683759904e1482aaa75b9bffbc4a',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            beginRendering: {
              surfaceId: 'skeleton-surface-next-actions',
              root: 'skeleton-root-next-actions',
              catalogId: 'coveo-commerce-v1',
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
      type: 'TOOL_CALL_START',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      toolCallName: 'render_next_actions',
      parentMessageId: 'cede34c2-c3c9-4647-9a82-114c3481d1f9',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_START',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      role: 'assistant',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'You',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: "'ve",
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' got',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' three',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' soli',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'd col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'd-water w',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'etsuits line',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'd up. The',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' **',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'WaveGuard Performance Full Suit',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: '** stands',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' out as the best',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' value with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' a',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: '4.9-star rating',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ', heat',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: '-retaining lining, and lifetime',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' seam warrantyâ€”',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'perfect',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' for reliable',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' cold-water performance',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: '{"actions"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: '.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' If',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: ': [{',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' you need maximum',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: '"t',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'ext',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: '":"Which',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: ' one sh',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'ould I choos',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' insulation for extreme',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'e for ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'regular ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'co',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'ld-wat',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'er s',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'urfing?",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: '"type":"foll',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'owup"',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: '},{"text":"S',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'how me ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'wetsuits',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: ' with thi',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'cker ',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'neoprene for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' conditions, the **',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: ' ex',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'treme col',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'd",',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: '"type":"fo',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'll',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'owup"}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: ',{"text":"Wh',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'ThermoFlex Winter Wet',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: 'suit** with',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' its',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'at accessori',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'es do I n',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'eed for',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: ' c',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'old-wa',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'ter sur',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'fin',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: 'g?","type":',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: '"followup"}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_ARGS',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      delta: ']}',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' 7mm thickness is the',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_END',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' way',
    },
  },
  {
    event: 'message',
    data: {
      type: 'ACTIVITY_SNAPSHOT',
      timestamp: 1781801695695,
      messageId: 'activity-eef5683759904e1482aaa75b9bffbc4a',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            beginRendering: {
              surfaceId: 'next-actions-surface',
              root: 'root-next-actions-surface',
              catalogId: 'coveo-commerce-v1',
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
                          valueString:
                            'Which one should I choose for regular cold-water surfing?',
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
                          valueString:
                            'Show me wetsuits with thicker neoprene for extreme cold',
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
                          valueString:
                            'What accessories do I need for cold-water surfing?',
                        },
                        {
                          key: 'type',
                          valueString: 'followup',
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
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' to go.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TOOL_CALL_RESULT',
      messageId: '108a0f87-75b2-41c3-9430-4e27146dbcf6',
      toolCallId: 'tooluse_MJpVnSLAlIBnGhrDaCaGzz',
      content: '"NextActionsBar rendered on surface \'next-actions-surface\'."',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' The **ZenSurf Full',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' Suit** is',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' great if',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' sustainability',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' matters',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' to',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
      delta: ' you.',
    },
  },
  {
    event: 'message',
    data: {
      type: 'TEXT_MESSAGE_END',
      messageId: '32c6ed27-f93e-42f0-9462-055595d5d7ff',
    },
  },
  {
    event: 'message',
    data: {
      type: 'STATE_SNAPSHOT',
      snapshot: {
        policy_execution_state: {
          current_state: 'respond/complete',
          completed_actions: [
            ['route/intake_fresh', 'graph'],
            ['comparison/resolve', 'graph'],
            ['comparison/render', 'graph'],
            ['respond/next_actions', 'graph'],
            ['respond/finalize', 'graph'],
            ['respond/complete', 'graph'],
          ],
          state_history: [
            ['entry', 'graph'],
            ['route/intake_fresh', 'graph'],
            ['comparison/resolve', 'graph'],
            ['comparison/render', 'graph'],
            ['respond/next_actions', 'graph'],
            ['respond/finalize', 'graph'],
            ['respond/complete', 'graph'],
          ],
          iteration_count: 6,
          metadata: {},
        },
        policy_eval_trace: {
          policy_name: 'commerce_discovery',
          policy_version: '4.7.1',
          initial_state: 'route/intake_fresh',
          final_state: 'respond/complete',
          terminal_reached: true,
          micro_run_count: 6,
          states_visited: [
            'route/intake_fresh',
            'comparison/resolve',
            'comparison/render',
            'respond/next_actions',
            'respond/finalize',
            'respond/complete',
          ],
          observed_actions: [
            'route_comparison',
            'coveo_commerce_search',
            'list_product_attributes',
            'lookup_cached_products',
            'lookup_cached_products',
            'register_products',
            'store_render_plan',
            'route_render',
            'route_finalize',
            'render_next_actions',
            'render_next_actions',
            'route_complete',
          ],
          nodes: [
            {
              state_name: 'route/intake_fresh',
              tools_called: ['route_comparison'],
              node_index: 0,
              error: null,
            },
            {
              state_name: 'comparison/resolve',
              tools_called: [
                'coveo_commerce_search',
                'list_product_attributes',
                'lookup_cached_products',
                'lookup_cached_products',
                'register_products',
                'store_render_plan',
                'route_render',
              ],
              node_index: 1,
              error: null,
            },
            {
              state_name: 'comparison/render',
              tools_called: ['route_finalize'],
              node_index: 2,
              error: null,
            },
            {
              state_name: 'respond/next_actions',
              tools_called: ['render_next_actions', 'render_next_actions'],
              node_index: 3,
              error: null,
            },
            {
              state_name: 'respond/finalize',
              tools_called: ['route_complete'],
              node_index: 4,
              error: null,
            },
            {
              state_name: 'respond/complete',
              tools_called: [],
              node_index: 5,
              error: null,
            },
          ],
          transitions: [
            {
              source_state: 'route/intake_fresh',
              target_state: 'comparison/resolve',
              action_name: 'route_comparison',
              tool_name: 'route_comparison',
              node_index: 0,
            },
            {
              source_state: 'comparison/resolve',
              target_state: 'comparison/render',
              action_name: 'route_render',
              tool_name: 'route_render',
              node_index: 1,
            },
            {
              source_state: 'comparison/render',
              target_state: 'respond/next_actions',
              action_name: 'route_finalize',
              tool_name: 'route_finalize',
              node_index: 2,
            },
            {
              source_state: 'respond/next_actions',
              target_state: 'respond/finalize',
              action_name: null,
              tool_name: 'render_next_actions',
              node_index: 3,
            },
            {
              source_state: 'respond/finalize',
              target_state: 'respond/complete',
              action_name: 'route_complete',
              tool_name: 'route_complete',
              node_index: 4,
            },
          ],
          recovery: {
            used: false,
            count: 0,
            events: [],
          },
          org_id: 'barcasportsmcy01fvu',
          session_id: '09c44953-d058-486b-b665-f1e520c19b6e',
          source: 'policy_telemetry',
        },
      },
    },
  },
  {
    event: 'message',
    data: {
      type: 'CUSTOM',
      name: 'eval_trace',
      value:
        '{"trace": {"policy_name": "commerce_discovery", "policy_version": "4.7.1", "initial_state": "route/intake_fresh", "final_state": "respond/complete", "terminal_reached": true, "micro_run_count": 6, "states_visited": ["route/intake_fresh", "comparison/resolve", "comparison/render", "respond/next_actions", "respond/finalize", "respond/complete"], "observed_actions": ["route_comparison", "coveo_commerce_search", "list_product_attributes", "lookup_cached_products", "lookup_cached_products", "register_products", "store_render_plan", "route_render", "route_finalize", "render_next_actions", "render_next_actions", "route_complete"], "nodes": [{"state_name": "route/intake_fresh", "tools_called": ["route_comparison"], "node_index": 0, "error": null}, {"state_name": "comparison/resolve", "tools_called": ["coveo_commerce_search", "list_product_attributes", "lookup_cached_products", "lookup_cached_products", "register_products", "store_render_plan", "route_render"], "node_index": 1, "error": null}, {"state_name": "comparison/render", "tools_called": ["route_finalize"], "node_index": 2, "error": null}, {"state_name": "respond/next_actions", "tools_called": ["render_next_actions", "render_next_actions"], "node_index": 3, "error": null}, {"state_name": "respond/finalize", "tools_called": ["route_complete"], "node_index": 4, "error": null}, {"state_name": "respond/complete", "tools_called": [], "node_index": 5, "error": null}], "transitions": [{"source_state": "route/intake_fresh", "target_state": "comparison/resolve", "action_name": "route_comparison", "tool_name": "route_comparison", "node_index": 0}, {"source_state": "comparison/resolve", "target_state": "comparison/render", "action_name": "route_render", "tool_name": "route_render", "node_index": 1}, {"source_state": "comparison/render", "target_state": "respond/next_actions", "action_name": "route_finalize", "tool_name": "route_finalize", "node_index": 2}, {"source_state": "respond/next_actions", "target_state": "respond/finalize", "action_name": null, "tool_name": "render_next_actions", "node_index": 3}, {"source_state": "respond/finalize", "target_state": "respond/complete", "action_name": "route_complete", "tool_name": "route_complete", "node_index": 4}], "recovery": {"used": false, "count": 0, "events": []}, "org_id": "barcasportsmcy01fvu", "session_id": "09c44953-d058-486b-b665-f1e520c19b6e", "source": "policy_telemetry"}}',
    },
  },
];

const response8Events: ConverseEvent[] = buildConversationResponse({
  runId,
  middleEvents,
  includeInitialStateSnapshot: false,
  includeFinalStateSnapshot: false,
});

export {response8Events};
