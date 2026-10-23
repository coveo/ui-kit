import type {Activity, AgentMessage} from '@coveo/thermidor';
import {z} from 'zod';

/**
 * The citations in an answer, sent as a `citations` activity beside the answer's text, whose
 * payload follows the question-answering agent's `citations.v1` contract.
 *
 * The answer's text holds no markers: each citation is a point in that text, counted in Unicode code
 * points. How citations look is decided here, by putting each cited document's label back into the
 * text at the points it is cited.
 */
export const CITATIONS_ACTIVITY_KIND = 'citations';

// Version 1 may gain optional fields, so the reader keeps fields it doesn't know.
const citedDocumentSchema = z
  .object({
    label: z.number().int().min(1),
    title: z.string().nullable(),
    link: z.string().nullable(),
    // Details are optional here, so a document without them still shows.
    details: z
      .object({source: z.object({name: z.string()}).passthrough().nullish()})
      .passthrough()
      .nullish(),
  })
  .passthrough();

export const citationsSchema = z
  .object({
    answerMessageId: z.string().min(1),
    citations: z
      .array(
        z.object({offset: z.number().int().min(0), passage: z.number().int().min(0)}).passthrough()
      )
      .min(1),
    passages: z
      .array(z.object({document: z.number().int().min(1), text: z.string()}).passthrough())
      .min(1),
    documents: z.array(citedDocumentSchema).min(1),
  })
  .passthrough();

export type Citations = z.infer<typeof citationsSchema>;
export type CitedDocument = z.infer<typeof citedDocumentSchema>;

/** The citations among `activities`, in arrival order. Payloads that break the contract are left out. */
export function citationsIn(activities: readonly Activity[]): Citations[] {
  return activities.flatMap((activity) => {
    if (activity.kind !== CITATIONS_ACTIVITY_KIND) {
      return [];
    }
    const parsed = citationsSchema.safeParse(activity.payload);
    return parsed.success ? [parsed.data] : [];
  });
}

/** The answer's text with each cited document's label, as `[n]`, at the points it is cited. */
export function annotateAnswer(text: string, citations: Citations): string {
  const documents = new Map(citations.documents.map((document) => [document.label, document]));
  const labelsAt = new Map<number, number[]>();
  for (const citation of citations.citations) {
    const label = citations.passages[citation.passage]?.document;
    if (label === undefined) {
      continue;
    }
    const labels = labelsAt.get(citation.offset) ?? [];
    if (!labels.includes(label)) {
      labels.push(label);
    }
    labelsAt.set(citation.offset, labels);
  }

  // Offsets count code points, so split the text into code points, not UTF-16 units.
  const codePoints = Array.from(text);
  return codePoints
    .map((codePoint, offset) => marks(labelsAt.get(offset), documents) + codePoint)
    .concat(marks(labelsAt.get(codePoints.length), documents))
    .join('');
}

function marks(labels: number[] | undefined, documents: Map<number, CitedDocument>): string {
  return (labels ?? [])
    .map((label) => {
      const link = documents.get(label)?.link;
      return link ? `[\\[${label}\\]](${link})` : `\\[${label}\\]`;
    })
    .join('');
}

/** `messages` with each answer's citations put back into its text. */
export function withInlineCitations(
  messages: AgentMessage[],
  citations: readonly Citations[]
): AgentMessage[] {
  if (citations.length === 0) {
    return messages;
  }
  const byAnswer = new Map(citations.map((answer) => [answer.answerMessageId, answer]));
  return messages.map((message) => {
    const answer = byAnswer.get(message.id);
    return answer ? {...message, content: annotateAnswer(message.content, answer)} : message;
  });
}

/** Each document the citations cite, once, by label. */
export function citedDocuments(citations: readonly Citations[]): CitedDocument[] {
  const byLabel = new Map<number, CitedDocument>();
  for (const answer of citations) {
    for (const document of answer.documents) {
      byLabel.set(document.label, document);
    }
  }
  return [...byLabel.values()].sort((a, b) => a.label - b.label);
}
