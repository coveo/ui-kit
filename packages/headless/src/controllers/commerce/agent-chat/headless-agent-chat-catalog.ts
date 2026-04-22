import type {Controller} from '../../controller/headless-controller.js';
import {buildController} from '../../controller/headless-controller.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import type {AgentChatMessage} from '../../../features/commerce/agent-chat/agent-chat-state.js';
import type {AgentChatState} from '../../../features/commerce/agent-chat/agent-chat-state.js';
import {selectAgentChatMessages} from '../../../features/commerce/agent-chat/agent-chat-selectors.js';
import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '../../../utils/commerce-extractors.js';
import type {
  CatalogComponent,
  NextAction,
  Product,
  ServerToClientMessage,
} from '../../../utils/commerce-types.js';

export interface AgentChatCatalogActivityState {
  activityId: string;
  messageId: string;
  productsBySurface: Record<string, Product[]>;
  actionsBySurface: Record<string, NextAction[]>;
  catalogComponents: CatalogComponent[];
  allProducts: Product[];
  hasNextActionsComponent: boolean;
}

export interface AgentChatCatalogMessageState {
  messageId: string;
  productsBySurface: Record<string, Product[]>;
}

export interface AgentChatCatalogControllerState {
  activities: Record<string, AgentChatCatalogActivityState>;
  messages: Record<string, AgentChatCatalogMessageState>;
}

/**
 * Derives catalog-ready data from `AgentChat` activities.
 *
 * This controller is read-only and computes catalog data from existing
 * `agentChat` state. It does not own reducers or dispatch actions.
 *
 * @group Controllers
 */
export interface AgentChatCatalog extends Controller {
  /**
   * The current derived catalog state.
   */
  state: AgentChatCatalogControllerState;

  /**
   * Gets derived catalog data for a specific activity.
   */
  getActivity(activityId: string): AgentChatCatalogActivityState | null;

  /**
   * Gets message-level product surfaces for bundle resolution.
   */
  getMessageProductsBySurface(messageId: string): Record<string, Product[]>;
}

/**
 * Creates an `AgentChatCatalog` controller instance.
 *
 * @param engine - The commerce engine instance.
 * @returns An `AgentChatCatalog` controller instance.
 *
 * @group Controllers
 */
export function buildAgentChatCatalog(
  engine: CommerceEngine
): AgentChatCatalog {
  const controller = buildController(engine);
  const getState = () =>
    engine[stateKey] as unknown as {
      agentChat?: AgentChatState;
    };

  const getCatalogState = () =>
    buildAgentChatCatalogState(selectAgentChatMessages(getState()));

  return {
    ...controller,

    get state() {
      return getCatalogState();
    },

    getActivity(activityId: string) {
      return getCatalogState().activities[activityId] ?? null;
    },

    getMessageProductsBySurface(messageId: string) {
      return getCatalogState().messages[messageId]?.productsBySurface ?? {};
    },
  };
}

function buildAgentChatCatalogState(
  messages: AgentChatMessage[]
): AgentChatCatalogControllerState {
  const activities: Record<string, AgentChatCatalogActivityState> = {};
  const messageCatalog: Record<string, AgentChatCatalogMessageState> = {};

  for (const message of messages) {
    if (!message.activities?.length) {
      continue;
    }

    const messageOperations: ServerToClientMessage[] = [];

    for (const activity of message.activities) {
      if (activity.type !== 'a2ui-surface') {
        continue;
      }

      const operations = extractOperations(activity.data);
      if (!operations.length) {
        continue;
      }

      messageOperations.push(...operations);

      const productsBySurface = extractProductsBySurface(operations);
      const actionsBySurface = extractActionsBySurface(operations);
      const catalogComponents = extractCatalogComponents(operations);

      activities[activity.id] = {
        activityId: activity.id,
        messageId: message.id,
        productsBySurface: mapToRecord(productsBySurface),
        actionsBySurface: mapToRecord(actionsBySurface),
        catalogComponents,
        allProducts: uniqueProducts(productsBySurface),
        hasNextActionsComponent: catalogComponents.some((component) =>
          isType(component.type, 'NextActionsBar')
        ),
      };
    }

    if (!messageOperations.length) {
      continue;
    }

    messageCatalog[message.id] = {
      messageId: message.id,
      productsBySurface: mapToRecord(
        extractProductsBySurface(messageOperations)
      ),
    };
  }

  return {
    activities,
    messages: messageCatalog,
  };
}

function extractOperations(data: unknown): ServerToClientMessage[] {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const operations = (data as {operations?: unknown}).operations;
  if (!Array.isArray(operations)) {
    return [];
  }

  return operations as ServerToClientMessage[];
}

function mapToRecord<T>(values: Map<string, T[]>): Record<string, T[]> {
  const record: Record<string, T[]> = {};
  for (const [key, value] of values.entries()) {
    record[key] = value;
  }
  return record;
}

function uniqueProducts(productsBySurface: Map<string, Product[]>): Product[] {
  return Array.from(productsBySurface.values())
    .flat()
    .filter((product, index, products) => {
      const key =
        product.ec_product_id ||
        `${product.ec_name ?? ''}-${product.ec_price ?? ''}`;
      return (
        products.findIndex((candidate) => {
          const candidateKey =
            candidate.ec_product_id ||
            `${candidate.ec_name ?? ''}-${candidate.ec_price ?? ''}`;
          return candidateKey === key;
        }) === index
      );
    });
}

function normalizeType(type: string): string {
  return type.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function isType(type: string, expected: string): boolean {
  const normalized = normalizeType(type);
  const normalizedExpected = normalizeType(expected);
  return (
    normalized === normalizedExpected || normalized.includes(normalizedExpected)
  );
}
