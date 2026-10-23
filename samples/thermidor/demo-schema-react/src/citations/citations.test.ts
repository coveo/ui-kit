import type {Activity} from '@coveo/thermidor';
import {describe, expect, it} from 'vitest';
import {
  annotateAnswer,
  citationsIn,
  citedDocuments,
  citationsSchema,
  withInlineCitations,
  type Citations,
} from './citations.js';

// The example in the question-answering agent's citations.v1.schema.json.
const CONTRACT_EXAMPLE = {
  answerMessageId: 'msg-1',
  citations: [
    {offset: 34, passage: 0},
    {offset: 34, passage: 1},
    {offset: 71, passage: 0},
  ],
  passages: [
    {document: 2, text: 'Requests are limited to 50 per second per organization.'},
    {document: 1, text: 'Exceeding the limit returns HTTP 429.'},
  ],
  documents: [
    {
      label: 2,
      ref: {corpus: {kind: 'coveo', name: 'acme'}, key: 'doc-42'},
      title: 'Rate limits',
      link: 'https://docs.example.com/rate-limits',
      details: {
        source: {name: 'Product Docs'},
        coveo: {primaryId: 'doc-42', permanentId: 'a1b2c3'},
      },
    },
    {
      label: 1,
      ref: {corpus: {kind: 'coveo', name: 'acme'}, key: 'doc-7'},
      title: null,
      link: null,
      details: {source: null, coveo: null},
    },
  ],
};

function activity(kind: string, payload: unknown, id = 'a1'): Activity {
  return {id, kind, replace: false, payload: payload as Record<string, unknown>};
}

const example: Citations = citationsSchema.parse(CONTRACT_EXAMPLE);

describe('citationsIn', () => {
  it('reads the contract example, keeping fields it does not know', () => {
    const [read] = citationsIn([activity('citations', CONTRACT_EXAMPLE)]);

    expect(read).toEqual(CONTRACT_EXAMPLE);
  });

  it('reads documents without details', () => {
    const withoutDetails = {
      ...CONTRACT_EXAMPLE,
      documents: [{label: 1, title: 'Doc', link: null}],
    };

    expect(citationsIn([activity('citations', withoutDetails)])).toHaveLength(1);
  });

  it('leaves out other activities and payloads that break the contract', () => {
    const broken = {...CONTRACT_EXAMPLE, citations: []};

    expect(
      citationsIn([
        activity('a2ui-surface', {}),
        activity('citations', broken, 'a2'),
        activity('citations', CONTRACT_EXAMPLE, 'a3'),
      ])
    ).toEqual([CONTRACT_EXAMPLE]);
  });
});

describe('annotateAnswer', () => {
  it('puts each cited label at its offset, linked when the document has a link', () => {
    const citations = citationsSchema.parse({
      ...CONTRACT_EXAMPLE,
      citations: [
        {offset: 5, passage: 0},
        {offset: 5, passage: 1},
        {offset: 10, passage: 0},
      ],
    });

    expect(annotateAnswer('Fifty per second.', citations)).toBe(
      'Fifty[\\[2\\]](https://docs.example.com/rate-limits)\\[1\\] per [\\[2\\]](https://docs.example.com/rate-limits)second.'
    );
  });

  it('counts offsets in code points, and cites the end of the text', () => {
    const citations = citationsSchema.parse({
      ...CONTRACT_EXAMPLE,
      citations: [{offset: 3, passage: 1}],
    });

    expect(annotateAnswer('🙂🙂🙂', citations)).toBe('🙂🙂🙂\\[1\\]');
  });

  it('cites a document once per point, however many of its passages are cited there', () => {
    const citations = citationsSchema.parse({
      ...CONTRACT_EXAMPLE,
      passages: [
        {document: 1, text: 'first'},
        {document: 1, text: 'second'},
      ],
      citations: [
        {offset: 0, passage: 0},
        {offset: 0, passage: 1},
      ],
    });

    expect(annotateAnswer('x', citations)).toBe('\\[1\\]x');
  });
});

describe('withInlineCitations', () => {
  it('annotates the answer the citations name, and no other message', () => {
    const messages = [
      {id: 'msg-0', content: 'Hello.', role: 'assistant'},
      {id: 'msg-1', content: 'x'.repeat(80), role: 'assistant'},
    ];

    const [other, answer] = withInlineCitations(messages, [example]);

    expect(other).toBe(messages[0]);
    expect(answer.content).toContain('\\[1\\]');
    expect(answer.content).toContain('[\\[2\\]](https://docs.example.com/rate-limits)');
  });
});

describe('citedDocuments', () => {
  it('lists each cited document once, by label', () => {
    const later = citationsSchema.parse({
      ...CONTRACT_EXAMPLE,
      answerMessageId: 'msg-2',
      documents: [{...CONTRACT_EXAMPLE.documents[0], title: 'Rate limits'}],
    });

    expect(citedDocuments([example, later]).map((document) => document.label)).toEqual([1, 2]);
  });
});
