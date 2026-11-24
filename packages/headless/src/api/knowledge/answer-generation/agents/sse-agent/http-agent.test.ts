import {EventType, type RunAgentInput} from '@ag-ui/core';
import {afterEach, beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import type {AgentSubscriber} from './agent-subscriber.js';
import {HttpAgent} from './http-agent.js';

const encoder = new TextEncoder();
const toFrame = (event: object) => `data: ${JSON.stringify(event)}\n\n`;

const buildStreamResponse = (events: object[]) =>
  new Response(events.map(toFrame).join(''), {
    status: 200,
    headers: {'Content-Type': 'text/event-stream'},
  });

const abortError = () => new DOMException('The operation was aborted.', 'AbortError');

const runStarted = {type: EventType.RUN_STARTED, runId: 'r1', threadId: 't1'};
const runFinished = {
  type: EventType.RUN_FINISHED,
  runId: 'r1',
  threadId: 't1',
  result: {completionReason: 'ANSWERED'},
};

describe('HttpAgent', () => {
  let fetchMock: Mock<typeof fetch>;
  let agent: HttpAgent;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    agent = new HttpAgent({url: 'https://example.com/agent', headers: {'X-Custom': 'yes'}});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('POSTs the run input to the configured URL', async () => {
    fetchMock.mockResolvedValue(buildStreamResponse([]));

    await agent.runAgent({runId: 'r1', forwardedProps: {q: 'hello'}});

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/agent');
    expect(init).toMatchObject({
      method: 'POST',
      headers: {
        'X-Custom': 'yes',
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
    });
    expect(init?.signal).toBe(agent.abortController.signal);
    expect(JSON.parse(init?.body as string)).toEqual({
      threadId: agent.threadId,
      runId: 'r1',
      state: {},
      messages: [],
      tools: [],
      context: [],
      forwardedProps: {q: 'hello'},
    });
  });

  it('uses the request options of a subclass', async () => {
    class CustomAgent extends HttpAgent {
      protected requestInit(input: RunAgentInput): RequestInit {
        return {method: 'PUT', body: JSON.stringify(input.forwardedProps)};
      }
    }
    fetchMock.mockResolvedValue(buildStreamResponse([]));

    await new CustomAgent({url: 'https://example.com/agent'}).runAgent({
      forwardedProps: {q: 'hello'},
    });

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/agent', {
      method: 'PUT',
      body: '{"q":"hello"}',
    });
  });

  it('keeps the thread id across runs and generates a run id per run', async () => {
    const inputs: RunAgentInput[] = [];
    const subscriber: AgentSubscriber = {
      onRunStartedEvent: ({input}) => inputs.push(input),
    };
    fetchMock.mockImplementation(async () => buildStreamResponse([runStarted]));

    await agent.runAgent({}, subscriber);
    await agent.runAgent({}, subscriber);

    expect(inputs[0].threadId).toBe(agent.threadId);
    expect(inputs[1].threadId).toBe(agent.threadId);
    expect(inputs[0].runId).toEqual(expect.any(String));
    expect(inputs[0].runId).not.toBe(inputs[1].runId);
  });

  it('uses the configured thread id', () => {
    expect(new HttpAgent({url: 'https://example.com', threadId: 't9'}).threadId).toBe('t9');
  });

  it('notifies the subscriber of each event with the event, agent and input', async () => {
    const custom = {type: EventType.CUSTOM, name: 'header', value: {contentFormat: 'text/plain'}};
    const runError = {type: EventType.RUN_ERROR, message: 'boom', code: 'KNOWLEDGE:X'};
    const stepStarted = {type: EventType.STEP_STARTED, stepName: 'Searching', timestamp: 1};
    const stepFinished = {type: EventType.STEP_FINISHED, stepName: 'Searching', timestamp: 2};
    const toolCallStart = {type: EventType.TOOL_CALL_START, toolCallId: 'tc', toolCallName: 's'};
    const toolCallArgs = {type: EventType.TOOL_CALL_ARGS, toolCallId: 'tc', delta: '{"q":"x"}'};
    const toolCallEnd = {type: EventType.TOOL_CALL_END, toolCallId: 'tc'};
    const textContent = {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm', delta: 'Hi'};
    fetchMock.mockResolvedValue(
      buildStreamResponse([
        runStarted,
        custom,
        stepStarted,
        toolCallStart,
        toolCallArgs,
        toolCallEnd,
        stepFinished,
        textContent,
        runError,
        runFinished,
      ])
    );
    const calls: [string, unknown][] = [];
    const record =
      (name: string) =>
      ({event, agent: eventAgent, input}: {event: unknown; agent: HttpAgent; input: unknown}) => {
        expect(eventAgent).toBe(agent);
        expect(input).toMatchObject({runId: 'r1', forwardedProps: {q: 'hello'}});
        calls.push([name, event]);
      };

    await agent.runAgent(
      {runId: 'r1', forwardedProps: {q: 'hello'}},
      {
        onRunStartedEvent: record('runStarted'),
        onCustomEvent: record('custom'),
        onStepStartedEvent: record('stepStarted'),
        onToolCallStartEvent: record('toolCallStart'),
        onToolCallArgsEvent: record('toolCallArgs'),
        onToolCallEndEvent: record('toolCallEnd'),
        onStepFinishedEvent: record('stepFinished'),
        onTextMessageContentEvent: record('textContent'),
        onRunErrorEvent: record('runError'),
        onRunFinishedEvent: record('runFinished'),
      }
    );

    expect(calls).toEqual([
      ['runStarted', runStarted],
      ['custom', custom],
      ['stepStarted', stepStarted],
      ['toolCallStart', toolCallStart],
      ['toolCallArgs', toolCallArgs],
      ['toolCallEnd', toolCallEnd],
      ['stepFinished', stepFinished],
      ['textContent', textContent],
      ['runError', runError],
      ['runFinished', runFinished],
    ]);
  });

  it('notifies text message content for text message chunks', async () => {
    fetchMock.mockResolvedValue(
      buildStreamResponse([
        runStarted,
        {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', delta: 'Hello'},
        {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', delta: ' world'},
        runFinished,
      ])
    );
    const onTextMessageContentEvent = vi.fn();
    const onRunFinishedEvent = vi.fn();

    await agent.runAgent({}, {onTextMessageContentEvent, onRunFinishedEvent});

    expect(onTextMessageContentEvent.mock.calls.map(([{event}]) => event.delta)).toEqual([
      'Hello',
      ' world',
    ]);
    expect(onRunFinishedEvent).toHaveBeenCalledOnce();
  });

  it('ignores events without a matching callback, including unknown event types', async () => {
    fetchMock.mockResolvedValue(
      buildStreamResponse([runStarted, {type: 'SOMETHING_NEW', foo: 1}, runFinished])
    );
    const onRunFinishedEvent = vi.fn();

    await agent.runAgent({}, {onRunFinishedEvent});

    expect(onRunFinishedEvent).toHaveBeenCalledOnce();
  });

  it('logs an error thrown by a callback and keeps notifying', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('subscriber failure');
    fetchMock.mockResolvedValue(buildStreamResponse([runStarted, runFinished]));
    const onRunFinishedEvent = vi.fn();

    await agent.runAgent(
      {},
      {
        onRunStartedEvent: () => {
          throw error;
        },
        onRunFinishedEvent,
      }
    );

    expect(consoleError).toHaveBeenCalledWith('Subscriber error:', error);
    expect(onRunFinishedEvent).toHaveBeenCalledOnce();
  });

  it('is running only while the run is in progress', async () => {
    fetchMock.mockResolvedValue(buildStreamResponse([runStarted]));
    let isRunningDuringRun: boolean | undefined;

    const run = agent.runAgent(
      {},
      {
        onRunStartedEvent: ({agent: eventAgent}) => {
          isRunningDuringRun = eventAgent.isRunning;
        },
      }
    );
    expect(agent.isRunning).toBe(true);
    await run;

    expect(isRunningDuringRun).toBe(true);
    expect(agent.isRunning).toBe(false);
  });

  it('rejects with the status and body of an HTTP error response', async () => {
    fetchMock.mockResolvedValue(new Response('Unauthorized', {status: 401}));

    await expect(agent.runAgent()).rejects.toThrow('HTTP 401: Unauthorized');
    expect(agent.isRunning).toBe(false);
  });

  it('rejects on a network error', async () => {
    const error = new TypeError('Failed to fetch');
    fetchMock.mockRejectedValue(error);

    await expect(agent.runAgent()).rejects.toBe(error);
  });

  it('rejects and stops reading when a frame is not valid JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response(`${toFrame(runStarted)}data: not json\n\n${toFrame(runFinished)}`)
    );
    const onRunFinishedEvent = vi.fn();

    await expect(agent.runAgent({}, {onRunFinishedEvent})).rejects.toThrow(SyntaxError);
    expect(onRunFinishedEvent).not.toHaveBeenCalled();
    expect(agent.abortController.signal.aborted).toBe(true);
  });

  it('resolves without notifying when aborted before the response arrives', async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(abortError()));
        })
    );
    const onRunErrorEvent = vi.fn();

    const run = agent.runAgent({}, {onRunErrorEvent});
    agent.abortRun();

    await expect(run).resolves.toBeUndefined();
    expect(onRunErrorEvent).not.toHaveBeenCalled();
  });

  it('notifies an abort run error and resolves when aborted while streaming', async () => {
    fetchMock.mockImplementation(async (_url, init) => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(toFrame(runStarted)));
          init?.signal?.addEventListener('abort', () => controller.error(abortError()));
        },
      });
      return new Response(body);
    });
    const onRunErrorEvent = vi.fn();

    await expect(
      agent.runAgent({}, {onRunStartedEvent: () => agent.abortRun(), onRunErrorEvent})
    ).resolves.toBeUndefined();

    expect(onRunErrorEvent).toHaveBeenCalledOnce();
    expect(onRunErrorEvent.mock.calls[0][0].event).toMatchObject({
      type: EventType.RUN_ERROR,
      code: 'abort',
      message: 'The operation was aborted.',
    });
  });

  it('ends an open tool call chunk stream before the abort run error', async () => {
    const toolCallChunk = {
      type: EventType.TOOL_CALL_CHUNK,
      toolCallId: 'tc1',
      toolCallName: 'search',
      delta: '{"q":"x"}',
    };
    fetchMock.mockImplementation(async (_url, init) => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(toFrame(runStarted) + toFrame(toolCallChunk)));
          init?.signal?.addEventListener('abort', () => controller.error(abortError()));
        },
      });
      return new Response(body);
    });
    const calls: string[] = [];

    await agent.runAgent(
      {},
      {
        onToolCallArgsEvent: () => {
          calls.push('toolCallArgs');
          agent.abortRun();
        },
        onToolCallEndEvent: ({event}) => calls.push(`toolCallEnd:${event.toolCallId}`),
        onRunErrorEvent: ({event}) => calls.push(`runError:${event.code}`),
      }
    );

    expect(calls).toEqual(['toolCallArgs', 'toolCallEnd:tc1', 'runError:abort']);
  });

  it('aborts only the current run', async () => {
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(abortError()));
        })
    );

    const firstRun = agent.runAgent();
    const firstSignal = agent.abortController.signal;
    agent.abortRun();
    await firstRun;
    void agent.runAgent();

    expect(firstSignal.aborted).toBe(true);
    expect(agent.abortController.signal.aborted).toBe(false);
    agent.abortRun();
  });
});
