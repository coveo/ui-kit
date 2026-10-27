import type {Activity} from '@coveo/thermidor';
import {z} from 'zod';

/**
 * The IDs that name one turn in the agent's event log and in the logs of the services it called,
 * sent as a `TurnRef` custom event at the start of the turn.
 */
export const TURN_REF_KIND = 'TurnRef';

const id = z.string().min(1);
const turnRefSchema = z.object({conversation_id: id, turn_id: id, request_id: id});

export type TurnRef = z.infer<typeof turnRefSchema>;

/** The turn's IDs among `activities`, or none when the payload breaks the contract. */
export function turnRefIn(activities: readonly Activity[]): TurnRef | undefined {
  const turnRef = activities.find((activity) => activity.kind === TURN_REF_KIND);
  const parsed = turnRefSchema.safeParse(turnRef?.payload);
  return parsed.success ? parsed.data : undefined;
}
