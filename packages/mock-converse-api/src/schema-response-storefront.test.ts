import {beforeEach, describe, expect, it} from 'vitest';
import {converseStorefrontResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {buildStorefrontEvents, readStorefrontContext, resetStorefrontSessions} =
  converseStorefrontResponses;

const SHELL = 'storefront-preview';
const HOME = 'storefront-preview-home';
const ASSISTANT = 'storefront-preview-assistant';

const MEMBERSHIP: Record<string, string[]> = {
  [SHELL]: ['QuerySuggestions'],
  [HOME]: ['ProductCarousel'],
  [ASSISTANT]: [
    'ProductCarousel',
    'NextActionsBar',
    'ComparisonTable',
    'BundleDisplay',
    'ProductResearchCard',
  ],
};

type Message = Record<string, Record<string, unknown>>;

function request(context: string, message: string | null, extra: Record<string, unknown> = {}) {
  return {message, action: null, context: {cart: [], custom: {surfaceId: context}}, ...extra};
}

function eventData(event: ConverseEvent): Record<string, unknown> {
  return event.data as Record<string, unknown>;
}

function surfaceMessages(events: ConverseEvent[]): Message[] {
  return events
    .filter(
      (event) =>
        event.event === 'ACTIVITY_SNAPSHOT' && eventData(event).activityType === 'a2ui-surface'
    )
    .flatMap((event) => (eventData(event).content as {messages: Message[]}).messages ?? []);
}

function created(events: ConverseEvent[]) {
  return surfaceMessages(events)
    .filter((message) => message.createSurface)
    .map((message) => {
      const createSurface = message.createSurface as {
        surfaceId: string;
        components: Array<{id: string; component: string}>;
      };
      return {
        surfaceId: createSurface.surfaceId,
        root: createSurface.components.find((node) => node.id === 'root')?.component,
        keys: Object.keys(createSurface),
      };
    });
}

function deleted(events: ConverseEvent[]): string[] {
  return surfaceMessages(events)
    .filter((message) => message.deleteSurface)
    .map((message) => message.deleteSurface.surfaceId as string);
}

function sessionIdOf(events: ConverseEvent[]): string {
  const turnStarted = events.find((event) => event.event === 'turn_started');
  return (turnStarted?.data as {conversationSessionId: string}).conversationSessionId;
}

function suggestionsState(events: ConverseEvent[]) {
  return surfaceMessages(events).find((message) => message.updateDataModel)!.updateDataModel
    .value as {
    query: string;
    completions: Array<{expression: string}>;
    products: Array<{ec_name: string}>;
  };
}

describe('Storefront Preview mock (one session, several views)', () => {
  beforeEach(() => {
    resetStorefrontSessions();
  });

  it('recognizes a request by the view it names in context.custom.surfaceId', () => {
    expect(readStorefrontContext(request(SHELL, 'life'))).toBe(SHELL);
    expect(readStorefrontContext(request(HOME, ''))).toBe(HOME);
    expect(readStorefrontContext(request(ASSISTANT, 'kayaks'))).toBe(ASSISTANT);
    expect(readStorefrontContext(request('somewhere-else', 'life'))).toBeUndefined();
    expect(readStorefrontContext({message: 'life'})).toBeUndefined();
  });

  it('opens a session and answers a shell prompt with a suggestions surface', () => {
    const events = buildStorefrontEvents(request(SHELL, 'life'));

    expect(sessionIdOf(events)).toMatch(/^[0-9a-f-]{36}$/);
    expect(created(events)).toEqual([
      {
        surfaceId: expect.stringMatching(/^ui-/),
        root: 'QuerySuggestions',
        keys: ['surfaceId', 'catalogId', 'components'],
      },
    ]);
  });

  it('completes a query from the catalog, prefix matches first', () => {
    const state = suggestionsState(buildStorefrontEvents(request(SHELL, 'life')));

    expect(state.query).toBe('life');
    expect(state.completions[0].expression).toMatch(/^life/);
    expect(state.products.length).toBeGreaterThan(0);
  });

  it('suggests nothing for a query the catalog does not know', () => {
    const state = suggestionsState(buildStorefrontEvents(request(SHELL, 'zzzz')));

    expect(state.completions).toEqual([]);
    expect(state.products).toEqual([]);
  });

  it('gives every shell turn a new suggestions surface and deletes the previous one', () => {
    const first = buildStorefrontEvents(request(SHELL, 'life'));
    const conversationSessionId = sessionIdOf(first);
    const [firstSurface] = created(first);

    const second = buildStorefrontEvents(request(SHELL, 'life jackets', {conversationSessionId}));

    expect(sessionIdOf(second)).toBe(conversationSessionId);
    expect(deleted(second)).toEqual([firstSurface.surfaceId]);
    expect(created(second)).toHaveLength(1);
    expect(created(second)[0].surfaceId).not.toBe(firstSurface.surfaceId);
  });

  it('gives each page fresh surfaces and deletes the previous page ones', () => {
    const home = buildStorefrontEvents(request(HOME, ''));
    const conversationSessionId = sessionIdOf(home);
    const homeSurfaces = created(home);
    expect(homeSurfaces.map((surface) => surface.root)).toEqual([
      'ProductCarousel',
      'ProductCarousel',
    ]);

    const assistant = buildStorefrontEvents(
      request(ASSISTANT, 'boating safety', {conversationSessionId})
    );

    const homeIds = homeSurfaces.map((surface) => surface.surfaceId);
    expect(deleted(assistant).slice(0, homeIds.length)).toEqual(homeIds);
    expect(created(assistant).length).toBeGreaterThan(0);
  });

  it('keeps the suggestions surface when the page changes', () => {
    const shell = buildStorefrontEvents(request(SHELL, 'life'));
    const conversationSessionId = sessionIdOf(shell);
    const [suggestions] = created(shell);

    const home = buildStorefrontEvents(request(HOME, '', {conversationSessionId}));
    const assistant = buildStorefrontEvents(
      request(ASSISTANT, 'boating safety', {conversationSessionId})
    );

    expect(deleted(home)).not.toContain(suggestions.surfaceId);
    expect(deleted(assistant)).not.toContain(suggestions.surfaceId);
  });

  it('streams the reasoning before an assistant answer', () => {
    const events = buildStorefrontEvents(request(ASSISTANT, 'boating safety'));
    const types = events.map((event) => eventData(event).type);

    expect(types).toContain('REASONING_MESSAGE_CONTENT');
    expect(types.indexOf('REASONING_MESSAGE_START')).toBeLessThan(
      types.indexOf('TEXT_MESSAGE_START')
    );
  });

  it.each([
    [HOME, ''],
    [ASSISTANT, 'boating safety'],
    [ASSISTANT, 'build a beginner surfing kit with budget, mid-range, and premium options'],
    [ASSISTANT, 'i like cold-water surfing. compare wetsuits for it'],
    [ASSISTANT, 'tell me more about the thermoflex winter wetsuit'],
    [ASSISTANT, 'which kayak should I get?'],
    [ASSISTANT, 'what do I need to go snorkeling?'],
    [ASSISTANT, 'gift ideas under $50'],
    [ASSISTANT, 'water sports'],
    [ASSISTANT, 'anything else'],
  ])('only creates %s components that belong to its view (%s)', (context, prompt) => {
    const roots = created(buildStorefrontEvents(request(context, prompt))).map(
      (surface) => surface.root
    );

    expect(roots.length).toBeGreaterThan(0);
    for (const root of roots) {
      expect(MEMBERSHIP[context]).toContain(root);
    }
  });

  it('names every surface the way agent-gateway does, with no layout metadata', () => {
    const events = buildStorefrontEvents(
      request(ASSISTANT, 'i like cold-water surfing. compare wetsuits for it')
    );

    for (const surface of created(events)) {
      expect(surface.surfaceId).toMatch(/^ui-/);
      expect(surface.keys).not.toContain('metadata');
    }
  });

  it('only addresses surfaces it created', () => {
    const home = buildStorefrontEvents(request(HOME, ''));
    const conversationSessionId = sessionIdOf(home);
    const known = new Set(created(home).map((surface) => surface.surfaceId));

    const assistant = buildStorefrontEvents(
      request(ASSISTANT, 'boating safety', {conversationSessionId})
    );
    for (const surface of created(assistant)) {
      known.add(surface.surfaceId);
    }

    for (const message of surfaceMessages(assistant)) {
      const [operation] = Object.values(message).filter(
        (value) => typeof value === 'object' && value !== null
      );
      expect(known).toContain((operation as {surfaceId: string}).surfaceId);
    }
  });

  it('answers a component action with an empty run', () => {
    const shell = buildStorefrontEvents(request(SHELL, 'life'));
    const conversationSessionId = sessionIdOf(shell);

    const events = buildStorefrontEvents({
      ...request(ASSISTANT, null, {conversationSessionId}),
      action: {name: 'selectSearchOption', surfaceId: 'ui-x', context: {optionId: 'o-1'}},
    });

    expect(surfaceMessages(events)).toEqual([]);
    expect(events.at(-1)?.event).toBe('turn_complete');
  });
});
