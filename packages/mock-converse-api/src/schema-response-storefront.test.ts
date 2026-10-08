import {beforeEach, describe, expect, it} from 'vitest';
import {converseStorefrontResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {buildStorefrontEvents, readStorefrontContext, resetStorefrontSessions} =
  converseStorefrontResponses;

const SHELL = 'storefront-preview';
const HOME = 'storefront-preview-home';
const ASSISTANT = 'storefront-preview-assistant';

const MEMBERSHIP: Record<string, string[]> = {
  [SHELL]: ['QuerySuggestions', 'Cart'],
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

function surfaceMessages(events: ConverseEvent[]): Message[] {
  return events
    .filter(
      (event) =>
        event.event === 'ACTIVITY_SNAPSHOT' &&
        (event.data as Record<string, unknown>).activityType === 'a2ui-surface'
    )
    .flatMap(
      (event) =>
        ((event.data as {content: {messages: Message[]}}).content.messages ?? []) as Message[]
    );
}

function created(events: ConverseEvent[]) {
  return surfaceMessages(events)
    .filter((message) => message.createSurface)
    .map((message) => {
      const createSurface = message.createSurface as {
        surfaceId: string;
        metadata?: {extensions?: {coveo_layout?: {slot?: string}}};
        components: Array<{id: string; component: string}>;
      };
      return {
        surfaceId: createSurface.surfaceId,
        slot: createSurface.metadata?.extensions?.coveo_layout?.slot,
        root: createSurface.components.find((node) => node.id === 'root')?.component,
      };
    });
}

function deleted(events: ConverseEvent[]): string[] {
  return surfaceMessages(events)
    .filter((message) => message.deleteSurface)
    .map((message) => message.deleteSurface.surfaceId as string);
}

function updatedSurfaceIds(events: ConverseEvent[]): string[] {
  return surfaceMessages(events)
    .filter((message) => message.updateDataModel)
    .map((message) => message.updateDataModel.surfaceId as string);
}

function sessionIdOf(events: ConverseEvent[]): string {
  const turnStarted = events.find((event) => event.event === 'turn_started');
  return (turnStarted?.data as {conversationSessionId: string}).conversationSessionId;
}

describe('Storefront Preview mock (one session, several surfaces)', () => {
  beforeEach(() => {
    resetStorefrontSessions();
  });

  it('recognizes a request by the context it names in context.custom.surfaceId', () => {
    expect(readStorefrontContext(request(SHELL, 'life'))).toBe(SHELL);
    expect(readStorefrontContext(request('somewhere-else', 'life'))).toBeUndefined();
    expect(readStorefrontContext({message: 'life'})).toBeUndefined();
  });

  it('opens a session whose first shell turn creates the cart and suggestions surfaces', () => {
    const events = buildStorefrontEvents(request(SHELL, 'life'));

    expect(sessionIdOf(events)).toMatch(/^[0-9a-f-]{36}$/);
    expect(created(events)).toEqual([
      {surfaceId: expect.stringMatching(/^ui-/), slot: 'header.cart', root: 'Cart'},
      {
        surfaceId: expect.stringMatching(/^ui-/),
        slot: 'header.suggestions',
        root: 'QuerySuggestions',
      },
    ]);
    const suggestions = surfaceMessages(events).find((message) => message.updateDataModel)!
      .updateDataModel.value as {query: string; completions: unknown[]; products: unknown[]};
    expect(suggestions.query).toBe('life');
    expect(suggestions.completions.length).toBeGreaterThan(0);
    expect(suggestions.products.length).toBeGreaterThan(0);
  });

  it('updates the same suggestions surface on later shell turns of the session', () => {
    const first = buildStorefrontEvents(request(SHELL, 'life'));
    const conversationSessionId = sessionIdOf(first);
    const suggestionsId = created(first).find(
      (surface) => surface.root === 'QuerySuggestions'
    )!.surfaceId;

    const second = buildStorefrontEvents(request(SHELL, 'life jackets', {conversationSessionId}));

    expect(sessionIdOf(second)).toBe(conversationSessionId);
    expect(created(second)).toEqual([]);
    expect(updatedSurfaceIds(second)).toEqual([suggestionsId]);
  });

  it('gives each page fresh main surfaces and deletes the previous page ones', () => {
    const home = buildStorefrontEvents(request(HOME, ''));
    const conversationSessionId = sessionIdOf(home);
    const homeSurfaces = created(home).filter((surface) => surface.slot === 'main');
    expect(homeSurfaces.map((surface) => surface.root)).toEqual([
      'ProductCarousel',
      'ProductCarousel',
    ]);

    const assistant = buildStorefrontEvents(
      request(ASSISTANT, 'boating safety', {conversationSessionId})
    );

    expect(deleted(assistant)).toEqual(homeSurfaces.map((surface) => surface.surfaceId));
    const assistantSurfaces = created(assistant);
    expect(assistantSurfaces.length).toBeGreaterThan(0);
    expect(assistantSurfaces.every((surface) => surface.slot === 'main')).toBe(true);
    expect(assistantSurfaces.some((surface) => surface.root === 'Cart')).toBe(false);
  });

  it('keeps the shell surfaces when the page changes', () => {
    const shell = buildStorefrontEvents(request(SHELL, 'life'));
    const conversationSessionId = sessionIdOf(shell);
    const shellIds = created(shell).map((surface) => surface.surfaceId);

    const home = buildStorefrontEvents(request(HOME, '', {conversationSessionId}));
    const assistant = buildStorefrontEvents(
      request(ASSISTANT, 'boating safety', {conversationSessionId})
    );

    for (const surfaceId of shellIds) {
      expect(deleted(home)).not.toContain(surfaceId);
      expect(deleted(assistant)).not.toContain(surfaceId);
    }
  });

  it.each([
    [HOME, ''],
    [ASSISTANT, 'boating safety'],
    [ASSISTANT, 'build a beginner surfing kit with budget, mid-range, and premium options'],
    [ASSISTANT, 'i like cold-water surfing. compare wetsuits for it'],
    [ASSISTANT, 'tell me more about the thermoflex winter wetsuit'],
    [ASSISTANT, 'water sports'],
    [ASSISTANT, 'anything else'],
  ])('only creates %s components that belong to its area (%s)', (context, prompt) => {
    const events = buildStorefrontEvents(request(context, prompt));
    const pageRoots = created(events)
      .filter((surface) => surface.slot === 'main')
      .map((surface) => surface.root);

    expect(pageRoots.length).toBeGreaterThan(0);
    for (const root of pageRoots) {
      expect(MEMBERSHIP[context]).toContain(root);
    }
  });

  it('refreshes the suggestions surface for a fetchSuggestions action', () => {
    const shell = buildStorefrontEvents(request(SHELL, 'life'));
    const conversationSessionId = sessionIdOf(shell);
    const suggestionsId = created(shell).find(
      (surface) => surface.root === 'QuerySuggestions'
    )!.surfaceId;

    const events = buildStorefrontEvents({
      ...request(SHELL, null, {conversationSessionId}),
      action: {
        name: 'fetchSuggestions',
        surfaceId: suggestionsId,
        sourceComponentId: 'root',
        context: {query: 'safety'},
      },
    });

    expect(updatedSurfaceIds(events)).toEqual([suggestionsId]);
  });

  it('acknowledges a cart action without touching any surface', () => {
    const shell = buildStorefrontEvents(request(SHELL, 'life'));
    const conversationSessionId = sessionIdOf(shell);
    const cartId = created(shell).find((surface) => surface.root === 'Cart')!.surfaceId;

    const events = buildStorefrontEvents({
      ...request(HOME, null, {conversationSessionId}),
      action: {
        name: 'updateCart',
        surfaceId: cartId,
        sourceComponentId: 'root',
        context: {productId: 'p-1', quantity: 1, operation: 'add'},
      },
    });

    expect(surfaceMessages(events)).toEqual([]);
    expect(events.at(-1)?.event).toBe('turn_complete');
  });
});
