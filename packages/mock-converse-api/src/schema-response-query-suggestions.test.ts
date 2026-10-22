import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {buildQuerySuggestionsLookupEvents, isSuggestionsLookup} = converseSchemaResponses;

function lookup(query: string, surfaceId = 'template:header-search-box') {
  return {name: 'fetchSuggestions', surfaceId, sourceComponentId: 'root', context: {query}};
}

function eventData(event: ConverseEvent): Record<string, unknown> {
  return event.data as Record<string, unknown>;
}

function updateDataModelOps(events: ConverseEvent[]): Array<Record<string, unknown>> {
  return events
    .filter((event) => event.event === 'ACTIVITY_SNAPSHOT')
    .flatMap((event) => {
      const content = eventData(event).content as {messages: Array<Record<string, unknown>>};
      return content.messages.map((message) => message.updateDataModel as Record<string, unknown>);
    });
}

function expressions(query: string): string[] {
  const [op] = updateDataModelOps(buildQuerySuggestionsLookupEvents(lookup(query)));
  const value = op.value as {completions: Array<{expression: string}>};
  return value.completions.map((completion) => completion.expression);
}

describe('isSuggestionsLookup', () => {
  it('recognizes fetchSuggestions from the search box template, whatever the surface id', () => {
    expect(isSuggestionsLookup('search-box', lookup('surf'))).toBe(true);
    expect(isSuggestionsLookup('search-box', lookup('surf', 'template:drawer-search-box'))).toBe(
      true
    );
  });

  it('rejects a request without a surface template', () => {
    expect(isSuggestionsLookup(undefined, lookup('surf'))).toBe(false);
  });

  it('rejects another template, component or action', () => {
    expect(isSuggestionsLookup('other-template', lookup('surf'))).toBe(false);
    expect(
      isSuggestionsLookup('search-box', {...lookup('surf'), sourceComponentId: 'suggestions'})
    ).toBe(false);
    expect(isSuggestionsLookup('search-box', {...lookup('surf'), name: 'selectSuggestion'})).toBe(
      false
    );
  });

  it('rejects an action without a surface id', () => {
    expect(isSuggestionsLookup('search-box', {...lookup('surf'), surfaceId: null})).toBe(false);
  });
});

describe('buildQuerySuggestionsLookupEvents', () => {
  it('answers with one run holding a single updateDataModel', () => {
    const events = buildQuerySuggestionsLookupEvents(lookup('surf'));

    expect(events.map((event) => event.event)).toEqual([
      'RUN_STARTED',
      'ACTIVITY_SNAPSHOT',
      'RUN_FINISHED',
    ]);
    expect(eventData(events[1]).activityType).toBe('a2ui-surface');
    expect(updateDataModelOps(events)).toEqual([
      {
        surfaceId: 'template:header-search-box',
        path: '/state/root',
        value: {
          query: 'surf',
          completions: [
            {expression: 'surfboards', score: 100},
            {expression: 'surfboard leash', score: 95},
            {expression: 'surfboard bag', score: 90},
            {expression: 'surf wax', score: 85},
            {expression: 'surf shorts', score: 80},
          ],
        },
      },
    ]);
  });

  it('writes each instance at its own surface id', () => {
    const [header] = updateDataModelOps(buildQuerySuggestionsLookupEvents(lookup('kayak')));
    const [drawer] = updateDataModelOps(
      buildQuerySuggestionsLookupEvents(lookup('kayak', 'template:drawer-search-box'))
    );

    expect(header.surfaceId).toBe('template:header-search-box');
    expect(drawer.surfaceId).toBe('template:drawer-search-box');
    expect(drawer.value).toEqual(header.value);
  });

  it('lists prefix matches before substring matches, at most six', () => {
    expect(expressions('wetsuit')).toEqual([
      'wetsuits',
      'wetsuit gloves',
      'wetsuit boots',
      'winter wetsuit',
    ]);
    expect(expressions('s')).toHaveLength(6);
    expect(expressions('  Kayak ')).toEqual(['kayaks', 'kayak paddles', 'kayak spray skirt']);
  });

  it('is deterministic', () => {
    expect(expressions('surf')).toEqual(expressions('surf'));
  });

  it('returns no completions for an empty query or no match', () => {
    expect(expressions('')).toEqual([]);
    expect(expressions('   ')).toEqual([]);
    expect(expressions('snowboard')).toEqual([]);
  });

  it('opens no session: no turn events and no session keys', () => {
    for (const events of [
      buildQuerySuggestionsLookupEvents(lookup('surf')),
      buildQuerySuggestionsLookupEvents(lookup('surf'), {conversationSessionId: 'session-1'}),
    ]) {
      expect(events.map((event) => event.event)).not.toContain('turn_started');
      expect(events.map((event) => event.event)).not.toContain('turn_complete');
      for (const event of events) {
        expect(eventData(event)).not.toHaveProperty('conversationSessionId');
        expect(eventData(event)).not.toHaveProperty('conversationToken');
      }
    }
  });

  it("runs on the session's thread when there is one, and on a throwaway thread otherwise", () => {
    const withSession = buildQuerySuggestionsLookupEvents(lookup('surf'), {
      conversationSessionId: 'session-1',
    });
    const first = buildQuerySuggestionsLookupEvents(lookup('surf'));
    const second = buildQuerySuggestionsLookupEvents(lookup('surf'));

    expect(eventData(withSession[0]).threadId).toBe('session-1');
    expect(eventData(first[0]).threadId).not.toBe('session-1');
    expect(eventData(first[0]).threadId).not.toBe(eventData(second[0]).threadId);
  });

  it('starts and finishes the same run, with a new run id per lookup', () => {
    const first = buildQuerySuggestionsLookupEvents(lookup('surf'));
    const second = buildQuerySuggestionsLookupEvents(lookup('surf'));

    expect(eventData(first[2]).runId).toBe(eventData(first[0]).runId);
    expect(eventData(second[0]).runId).not.toBe(eventData(first[0]).runId);
  });
});
