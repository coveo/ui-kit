import type {Activity} from '@coveo/thermidor';
import {z} from 'zod';

/**
 * The questions a question-answering agent suggests asking next, sent as a `FollowUpQuestions`
 * custom event after its answer. Each question is an object, so the agent can add fields to it
 * later; the demo reads only its text.
 */
export const FOLLOW_UP_QUESTIONS_KIND = 'FollowUpQuestions';

const followUpQuestionsSchema = z
  .object({questions: z.array(z.object({text: z.string().min(1)}).passthrough())})
  .passthrough();

/**
 * The texts of the latest follow-up questions among `activities`. A payload that breaks the
 * contract counts as no questions.
 */
export function followUpQuestionsIn(activities: readonly Activity[]): string[] {
  const latest = activities.findLast((activity) => activity.kind === FOLLOW_UP_QUESTIONS_KIND);
  const parsed = followUpQuestionsSchema.safeParse(latest?.payload);
  return parsed.success ? parsed.data.questions.map((question) => question.text) : [];
}
