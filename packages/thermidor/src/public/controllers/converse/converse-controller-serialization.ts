import type {
  GenerativeState,
  RoutedInterfaceRegistry,
  RoutedUseCase,
  StateTurn,
} from '@/src/internal/features/generative/index.js';

const VALID_USE_CASES: Set<string> = new Set<string>(['commerceSearch', 'search']);

export interface SerializedConverseState {
  name: string;
  timestamp: number;
  conversationSessionId?: string;
  conversationToken?: string;
  turns: SerializedTurn[];
  activeTurnId: string | undefined;
}

export interface SerializedRoutedInterface {
  useCase: string;
  snapshot: Record<string, unknown>;
  query: string | undefined;
}

export interface SerializedTurn extends Omit<StateTurn, 'routedInterface'> {
  routedInterface?: SerializedRoutedInterface | undefined;
}

/**
 * Converts a `SerializedConverseState` into the internal `GenerativeState`
 * shape suitable for store hydration. Handles edge cases like marking
 * interrupted streams as errors.
 *
 * Only populates `routedInterface` on a turn when the registry has a
 * corresponding entry, ensuring store and registry stay in sync.
 */
export function deserializeToGenerativeState(
  serialized: SerializedConverseState,
  registry?: RoutedInterfaceRegistry
): GenerativeState {
  const turns: StateTurn[] = serialized.turns.map((serializedTurn) => {
    const {routedInterface, ...rest} = serializedTurn;
    const turn: StateTurn = {...rest};

    if (turn.status === 'streaming') {
      turn.status = 'error';
      turn.error = 'Stream was interrupted';
    }

    if (
      routedInterface &&
      VALID_USE_CASES.has(routedInterface.useCase) &&
      (!registry || registry.get(turn.id))
    ) {
      turn.routedInterface = {
        useCase: routedInterface.useCase as RoutedUseCase,
      };
    }

    return turn;
  });

  return {
    turns,
    activeTurnId: serialized.activeTurnId,
    conversationSessionId: serialized.conversationSessionId,
    conversationToken: serialized.conversationToken,
  };
}
