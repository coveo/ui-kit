import {delay, HttpResponse} from 'msw';

// Local EventType enum to match @ag-ui/core structure
// TODO: Replace with import from '@ag-ui/core' once added as dependency
enum EventType {
  RUN_STARTED = 'RUN_STARTED',
  RUN_FINISHED = 'RUN_FINISHED',
  STEP_STARTED = 'STEP_STARTED',
  STEP_FINISHED = 'STEP_FINISHED',
  TEXT_MESSAGE_CHUNK = 'TEXT_MESSAGE_CHUNK',
  CUSTOM = 'CUSTOM',
}

const THREAD_ID = 'thread-1';
const RUN_ID = 'run-1';

interface AgentEvent {
  type: EventType;
  threadId?: string;
  runId?: string;
  timestamp?: number;
  name?: string;
  value?: unknown;
  stepName?: string;
  messageId?: string;
  delta?: string;
  delayMs?: number; // Internal property for mock delays, stripped before sending
}

const buildMessage = (
  {
    type,
    name,
    value,
    stepName,
    messageId,
    delta,
  }: Omit<AgentEvent, 'threadId' | 'runId' | 'timestamp' | 'delayMs'>,
  delayMs?: number
): AgentEvent => {
  return {
    type,
    threadId: THREAD_ID,
    runId: RUN_ID,
    timestamp: Date.now(),
    ...(name !== undefined && {name}),
    ...(value !== undefined && {value}),
    ...(stepName !== undefined && {stepName}),
    ...(messageId !== undefined && {messageId}),
    ...(delta !== undefined && {delta}),
    ...(delayMs !== undefined && {delayMs}),
  };
};

const CITATIONS = [
  {
    id: '42.21238$https://coveodemo.atlassian.net/wiki/Space:TV/Page:2359302-29:0',
    title: 'How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359302/How+To+Resolve+Netflix+Connection+With+Tivo+on+XB+Family+Smart+TVs',
    permanentid: '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4',
    primaryId: 'JFDEQ5DYMJFWOU2XG43XS4KENUXDEMJSGM4C4ZDFMZQXK3DU',
    text: "Tivo can cause some problems with the Netflix App on your XBR6 Smart TV. Start by testing the Internet connection on your device To test the Internet connection on your TiVo, follow the steps below appropriate for your model. XBR6 Smart TV and XB Family of Smart TVs Step-by-step guide Series4 and newer DVRs Series3 and older DVRs From TiVo Central: 1. Select Settings & Messages 2. Select Settings 3. Select Network 4. Select View network diagnostics 5. Select Test Internet connection. From TiVo Central: 1. Select Messages & Settings 2. Select Settings 3. Select Phone & Network 4. Select View network diagnostics 5. Select TiVo service connection. Restart the device 1. Unplug your device from power for at least 10 seconds. 2. Plug your device back in. 3. Turn your device on with the power button. Note: All devices are different. Some may take up to 15 minutes to fully restart. Deactivate and reactivate your TiVo. To deactivate your TiVo, follow the steps below appropriate for your model. Series4 and newer DVRs Series3 and older DVRs From TiVo Central: 1. From the TiVo home screen, go to Tivo central 2. Choose Settings & Messages 3. Select Account & System info 4. Select Netflix Account information 5. Select deactivate this device From TiVo Central: 1. Select Video On Demand. 2. Select Netflix. 3. Select Netflix Account Information. 4. Select Deactivate this device. After you've deactivated your TiVo, launch Netflix again and enter your Netflix e-mail and password to reactivate. Troubleshoot",
    source: 'Coveo Sample - Confluence Cloud',
    fields: {
      filetype: 'html',
    },
  },
  {
    id: '42.21238$https://coveodemo.atlassian.net/wiki/Space:TV/Page:2359302-29:1',
    title: 'How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359302/How+To+Resolve+Netflix+Connection+With+Tivo+on+XB+Family+Smart+TVs',
    permanentid: '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4',
    primaryId: 'JFDEQ5DYMJFWOU2XG43XS4KENUXDEMJSGM4C4ZDFMZQXK3DU',
    text: "power button. Note: All devices are different. Some may take up to 15 minutes to fully restart. Deactivate and reactivate your TiVo. To deactivate your TiVo, follow the steps below appropriate for your model. Series4 and newer DVRs Series3 and older DVRs From TiVo Central: 1. From the TiVo home screen, go to Tivo central 2. Choose Settings & Messages 3. Select Account & System info 4. Select Netflix Account information 5. Select deactivate this device From TiVo Central: 1. Select Video On Demand. 2. Select Netflix. 3. Select Netflix Account Information. 4. Select Deactivate this device. After you've deactivated your TiVo, launch Netflix again and enter your Netflix e-mail and password to reactivate. Troubleshoot network connection issuesIf you're still not able to connect to Netflix, here are some steps to resolve network connection issues. If you've tried the steps above and still can't connect to Netflix, check to see if we've reported any service outages. It's pretty rare, but sometimes we have problems connecting to the Internet, too. Related articles - Page: Brad Test Article - Page: Besttech XBR6 TV Specifications - Page: How To Resolve Netflix Connection With Tivo on XB Family Smart TVs - Page: How To Resolve Netflix Android Connection Error on XB, XBR, and XBR6 Smart TV - Page: How To Resolve Netflix Playback Errors on Besttech XB Smart TVs User Comment Last modified on democ This is very useful, I have used this article multiple times to get me out of trouble! 04/11/2017 20:48:58",
    source: 'Coveo Sample - Confluence Cloud',
    fields: {
      filetype: 'html',
    },
  },
  {
    id: '42.21238$https://coveodemo.atlassian.net/wiki/Space:TV/Page:2359298-27:2',
    title: 'How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
    uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Playback Errors on Besttech XB Smart TVs',
    clickUri:
      'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359298/How+To+Resolve+Netflix+Playback+Errors+on+Besttech+XB+Smart+TVs',
    permanentid: '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a',
    primaryId: 'OJRE6RCIJV2VU2KLIRYDQUDINIXDEMJSGM4C4ZDFMZQXK3DU',
    text: "the problem by eliminating the router or wireless connectivity problems as a possible cause. 1. Turn off or unplug your smart TV. 2. Plug your smart TV directly into your modem using an Ethernet cable. 3. Unplug your modem from power for at least 30 seconds, then plug it back in and wait until no new indicator lights are blinking on. 4. Turn on your smart TV and attempt to stream again. If this step gets you streaming again through the Netflix App on your Besttech Smart TV: • If you've bypassed your router and successfully connected to Netflix directly through your modem, it's likely that the router itself is the source of the problem. • Bypassing the router will allow you to stream for now, but if this configuration isn't a perfect solution, you may want to contact whoever set up your home network for help resetting or re-configuring your router settings. If you're still not able to stream: • If you're connected directly to your modem and still can't stream Netflix, you may want to check with your equipment provider to make sure your modem and Internet service are functioning as intended. Related articles - Page: Brad Test Article - Page: Besttech XBR6 TV Specifications - Page: How To Resolve Netflix Connection With Tivo on XB Family Smart TVs - Page: How To Resolve Netflix Android Connection Error on XB, XBR, and XBR6 Smart TV - Page: How To Resolve Netflix Playback Errors on Besttech XB Smart TVs",
    source: 'Coveo Sample - Confluence Cloud',
    fields: {
      filetype: 'html',
    },
  },
];

const ANSWER = [
  '# Resolving Netflix Connection Issues with TiVo\n\nTo resolve Netflix connection issues with your TiVo, follow these steps:\n\n## Test Internet Connection\n',
  '1. **For Series4 and newer DVRs:**\n   - From TiVo Central, select **Settings & Messages**.\n   - Choose **Settings**.\n   - Select **Network**.\n   - Choose **View network diagnostics**.\n   - Select **Test Internet connection**.\n\n2. **For Series3 and older DVRs:**\n   - From TiVo Central, select **Messages &',
  ' Settings**.\\n   - Choose **Settings**.\\n   - Select **Phone & Network**.\\n   - Choose **View network diagnostics**.\\n   - Select **TiVo service connection**.\\n\\n## Restart Your Device\\n1. Unplug your TiVo device from power for at least **10 seconds**.\\n2. Plug it back in',
  '.\\n3. Turn on the device using the power button. (Note: Restarting may take up to **15 minutes**.)\\n\\n## Deactivate and Reactivate TiVo\\n1. **For Series4 and newer DVRs:**\\n   - From the TiVo home screen',
  ', go to **TiVo Central**.\\n   - Select **Settings & Messages**.\\n   - Choose **Account & System info**.\\n   - Select **Netflix Account information**.\\n   - Choose **Deactivate this device**.\\n\\n2. **For Series3 and older DVRs:**\\n   - From TiVo Central, select **Video On Demand**.\\n   - Choose **Netflix**',
  '.\\n   - Select **Netflix Account Information**.\\n   - Choose **Deactivate this device**.\\n\\nAfter deactivation, launch Netflix again and enter your Netflix email and password to reactivate.\\n\\n## Additional Troubleshooting\\nIf you still cannot connect to Netflix:\\n- Check for any reported service outages.\\n- Ensure your',
  ' modem and Internet service are functioning properly.\\n- If necessary, bypass your router by connecting your TiVo directly to the modem using an Ethernet cable to identify if the router is the issue.\\n\\nFollowing these steps should help resolve your Netflix connection issues with TiVo.',
];

const agentMessages: AgentEvent[] = [
  // Run starts
  buildMessage({
    type: EventType.RUN_STARTED,
  }),
  // Header event
  buildMessage({
    type: EventType.CUSTOM,
    name: 'header',
    value: {
      conversationId: THREAD_ID,
      contentFormat: 'text/markdown',
      followUpEnabled: true,
    },
  }),
  // First Step starts: searching
  buildMessage({
    type: EventType.STEP_STARTED,
    stepName: 'searching',
  }),
  // 1.5 second delay before finishing search
  buildMessage(
    {
      type: EventType.STEP_FINISHED,
      stepName: 'searching',
    },
    1500
  ),
  // Second Step starts: thinking
  buildMessage({
    type: EventType.STEP_STARTED,
    stepName: 'thinking',
  }),
  // 1.5 second delay before finishing thinking
  buildMessage(
    {
      type: EventType.STEP_FINISHED,
      stepName: 'thinking',
    },
    1500
  ),
  // Text message chunks - loop through ANSWER array
  ...ANSWER.map((textDelta) =>
    buildMessage({
      type: EventType.TEXT_MESSAGE_CHUNK,
      messageId: 'msg-1',
      delta: textDelta,
    })
  ),
  buildMessage({
    type: EventType.CUSTOM,
    name: 'citations',
    value: {
      citations: [...CITATIONS],
    },
  }),
  // TODO: Citations will be handled separately
  buildMessage({
    type: EventType.RUN_FINISHED,
  }),
];

const buildAnsweringStreamingResponse = (
  {
    messages = agentMessages,
    delayBetweenMessages = 'real',
  }: {
    messages?: AgentEvent[];
    delayBetweenMessages?: number | 'real' | 'infinite';
  } = {messages: agentMessages, delayBetweenMessages: 'real'}
) => {
  const defaultDelay =
    delayBetweenMessages === 'real'
      ? 100
      : delayBetweenMessages === 'infinite'
        ? Number.POSITIVE_INFINITY
        : delayBetweenMessages;

  const stream = new ReadableStream({
    start(controller) {
      for (const message of messages) {
        // Remove delayMs before sending to avoid including it in the SSE payload
        const {delayMs: _delayMs, ...messageToSend} = message;
        controller.enqueue(
          new TextEncoder().encode(
            `event: message\ndata: ${JSON.stringify(messageToSend)}\nretry: 10000\n\n`
          )
        );
      }
      controller.close();
    },
  });

  // Apply delay between messages based on per-message delayMs or default
  let messageIndex = 0;
  const latencyStream = new TransformStream({
    start() {},
    async transform(chunk, controller) {
      const message = messages[messageIndex];
      const delayMs = message?.delayMs ?? defaultDelay;
      await delay(delayMs);
      messageIndex++;
      controller.enqueue(chunk);
    },
  });

  return new HttpResponse(stream.pipeThrough(latencyStream), {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  });
};

const immediateBaseResponse = () =>
  buildAnsweringStreamingResponse({delayBetweenMessages: 0});
const baseResponse = () =>
  buildAnsweringStreamingResponse({delayBetweenMessages: 'real'});
const slowDelayedBaseResponse = () =>
  buildAnsweringStreamingResponse({delayBetweenMessages: 1000});

export {
  agentMessages,
  immediateBaseResponse,
  baseResponse,
  slowDelayedBaseResponse,
  buildAnsweringStreamingResponse,
};
