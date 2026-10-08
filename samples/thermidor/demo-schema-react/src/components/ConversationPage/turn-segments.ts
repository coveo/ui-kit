import type {Turn, TurnResponse} from '@coveo/thermidor';

/**
 * Where the run of a follow-up action starts in its turn.
 *
 * `@coveo/thermidor` streams an action's response into the turn that is already shown, so the
 * answer to a follow-up chip lands after the answer it follows. Recording how much the turn held
 * when the action was sent lets the page draw that answer as its own exchange.
 */
export interface FollowUp {
  /** The chip text the shopper selected, shown as their message. Absent for a search option. */
  prompt?: string;
  activityCount: number;
  messageCount: number;
  reasoningStepCount: number;
  surfaceCount: number;
}

/** One exchange of a turn: its answer, and the follow-up prompt that asked for it if any. */
export interface TurnSegment {
  prompt?: string;
  response: TurnResponse;
  surfaceIds: readonly string[];
}

export function startFollowUp(
  turn: Turn,
  surfaceIds: readonly string[],
  prompt: string | undefined
): FollowUp {
  return {
    ...(prompt ? {prompt} : {}),
    activityCount: turn.response.activities.length,
    messageCount: turn.response.agent?.messages.length ?? 0,
    reasoningStepCount: turn.response.agent?.reasoningSteps.length ?? 0,
    surfaceCount: surfaceIds.length,
  };
}

const TURN_START: FollowUp = {
  activityCount: 0,
  messageCount: 0,
  reasoningStepCount: 0,
  surfaceCount: 0,
};

/** Splits a turn into its first answer, then one segment per follow-up sent from it. */
export function splitTurn(
  turn: Turn,
  surfaceIds: readonly string[],
  followUps: readonly FollowUp[]
): TurnSegment[] {
  const starts = [TURN_START, ...followUps];
  const {activities, agent} = turn.response;

  return starts.map((start, index) => {
    const end = starts[index + 1];
    return {
      ...(start.prompt ? {prompt: start.prompt} : {}),
      response: {
        ...turn.response,
        activities: activities.slice(start.activityCount, end?.activityCount),
        ...(agent
          ? {
              agent: {
                messages: agent.messages.slice(start.messageCount, end?.messageCount),
                reasoningSteps: agent.reasoningSteps.slice(
                  start.reasoningStepCount,
                  end?.reasoningStepCount
                ),
              },
            }
          : {}),
      },
      surfaceIds: surfaceIds.slice(start.surfaceCount, end?.surfaceCount),
    };
  });
}
