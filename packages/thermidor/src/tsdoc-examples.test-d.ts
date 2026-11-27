/**
 * Type-checks the ```ts code blocks of the public TSDoc `@example` tags, which TypeDoc never
 * compiles. Each test holds one example verbatim, minus its imports, with the names the example
 * takes from the reader's app declared around it. `tsdoc-examples.test.ts` fails when an example
 * in the TSDoc no longer matches its copy here.
 */
import {expectTypeOf, test} from 'vitest';
import {z} from 'zod/v4';
import {createSession} from '@/src/index.js';
import type {
  A2uiMessage,
  ComponentActionNames,
  ContractsSchema,
  NavigatorContextProvider,
  Session,
  SessionConfig,
  SessionRequest,
  SessionSnapshot,
  Turn,
} from '@/src/index.js';

declare const ComponentContractsSchema: ContractsSchema;
declare const session: Session;
declare function useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T
): T;

test('@packageDocumentation example', async () => {
  function render(
    _turns: readonly Turn[],
    _a2uiMessages: readonly A2uiMessage[],
    _request: SessionRequest | undefined
  ): void {}

  const session = createSession({
    contracts: ComponentContractsSchema,
    organizationId: 'my-org',
    accessToken: 'xx-token',
    agentConfigurationId: '00000000-0000-0000-0000-000000000000',
    trackingId: 'my-tracking-id',
    navigatorContextProvider: () => ({
      clientId: 'my-client-id',
      location: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: 'en',
      country: 'US',
      currency: 'USD',
    }),
  });

  session.subscribe(() => {
    const {turns, a2uiMessages, request} = session.getSnapshot();
    render(turns, a2uiMessages, request);
  });

  await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'show me running shoes'}});
});

test('createSession examples', () => {
  const getNavigatorContext: NavigatorContextProvider = () => ({
    clientId: 'my-client-id',
    location: null,
    referrer: null,
    userAgent: null,
    language: 'en',
    country: 'US',
    currency: 'USD',
  });

  {
    const session = createSession({
      contracts: ComponentContractsSchema,
      organizationId: 'my-org',
      accessToken: 'xx-token',
      agentConfigurationId: '00000000-0000-0000-0000-000000000000',
      trackingId: 'my-tracking-id',
      navigatorContextProvider: getNavigatorContext,
    });
    expectTypeOf(session).toEqualTypeOf<Session<ContractsSchema>>();
  }

  const config: SessionConfig = {
    contracts: ComponentContractsSchema,
    organizationId: 'my-org',
    accessToken: 'xx-token',
    agentConfigurationId: '00000000-0000-0000-0000-000000000000',
    trackingId: 'my-tracking-id',
    navigatorContextProvider: getNavigatorContext,
  };
  const stored = {sessionId: session.sessionId, sessionToken: session.sessionToken};

  {
    const session = createSession({
      ...config,
      sessionId: stored.sessionId,
      sessionToken: stored.sessionToken,
    });
    expectTypeOf(session).toEqualTypeOf<Session<ContractsSchema>>();
  }
});

test('SubmitPromptAction example', async () => {
  await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'show me running shoes'}});
});

test('Session.dispatchAction example', () => {
  // `@a2ui/web_core`'s `MessageProcessor`, as far as the example uses it.
  type ActionListener = (action: {
    name: string;
    surfaceId: string;
    sourceComponentId: string;
    timestamp: string;
    context: Record<string, unknown>;
    [key: string]: unknown;
  }) => void | Promise<void>;
  class MessageProcessor {
    constructor(
      readonly catalogs: readonly unknown[],
      readonly actionHandler: ActionListener,
      readonly options: {version: '1.0'}
    ) {}
  }
  const catalogs: unknown[] = [];

  const processor = new MessageProcessor(catalogs, session.dispatchAction, {version: '1.0'});
  expectTypeOf(processor).toEqualTypeOf<MessageProcessor>();
});

test('Session.subscribe example', () => {
  function render(_snapshot: SessionSnapshot): void {}

  const unsubscribe = session.subscribe(() => render(session.getSnapshot()));
  expectTypeOf(unsubscribe).toEqualTypeOf<() => void>();
});

test('Session.getSnapshot example', () => {
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot);
  expectTypeOf(snapshot).toEqualTypeOf<SessionSnapshot>();
});

test('ComponentActionNames example', () => {
  const contracts = z.discriminatedUnion('component', [
    z.strictObject({
      component: z.literal('RegularFacet'),
      actions: z.strictObject({search: z.strictObject({payload: z.strictObject({})})}).optional(),
    }),
  ]);

  type FacetActions = ComponentActionNames<typeof contracts>;
  // {readonly RegularFacet?: readonly 'search'[]}
  expectTypeOf<FacetActions>().toEqualTypeOf<{readonly RegularFacet?: readonly 'search'[]}>();
});
