import type {GeneratedAnswerCitation} from '@coveo/headless';
import {delay, HttpResponse} from 'msw';

interface Citations extends Partial<GeneratedAnswerCitation> {
  primaryId?: string;
}

interface MessagePayload {
  payloadType: string;
  payload: Record<string, unknown>;
  finishReason?: string | null;
  errorMessage?: string | null;
  statusCode?: number | null;
}

interface MessagePayloadStringified {
  payloadType: string;
  payload: string;
  finishReason?: string | null;
  errorMessage?: string | null;
  statusCode?: number | null;
}

const buildMessage = ({
  payloadType,
  payload,
  finishReason = null,
  errorMessage = null,
  statusCode = null,
}: MessagePayload) => ({
  payloadType,
  payload: JSON.stringify(payload),
  finishReason,
  errorMessage,
  statusCode,
});

const Messages = {
  Header: buildMessage({
    payloadType: 'genqa.headerMessageType',
    payload: {answerStyle: 'default', contentFormat: 'text/markdown'},
  }),
  AnswerPart: ({textDelta, padding}: {textDelta: string; padding: string}) =>
    buildMessage({
      payloadType: 'genqa.messageType',
      payload: {textDelta, padding},
    }),
  Citations: (citations: Citations[]) =>
    buildMessage({
      payloadType: 'genqa.citationsType',
      payload: {
        citations,
      },
    }),
  EndOfStream: buildMessage({
    payloadType: 'genqa.endOfStreamType',
    payload: {answerGenerated: true},
    finishReason: 'COMPLETED',
  }),
};

const rgaMessages: MessagePayloadStringified[] = [
  Messages.Header,
  Messages.AnswerPart({textDelta: '', padding: '12345678901234567'}),
  Messages.AnswerPart({
    textDelta:
      '# Resolving Netflix Connection Issues with TiVo\n\nTo resolve Netflix connection issues with your TiVo, follow these steps:\n\n## Test Internet Connection\n',
    padding: '1234567890123',
  }),
  Messages.AnswerPart({
    textDelta:
      '1. **For Series4 and newer DVRs:**\n   - From TiVo Central, select **Settings & Messages**.\n   - Choose **Settings**.\n   - Select **Network**.\n   - Choose **View network diagnostics**.\n   - Select **Test Internet connection**.\n\n2. **For Series3 and older DVRs:**\n   - From TiVo Central, select **Messages &',
    padding: '1234567890123456789',
  }),
  Messages.AnswerPart({
    textDelta:
      ' Settings**.\\n   - Choose **Settings**.\\n   - Select **Phone & Network**.\\n   - Choose **View network diagnostics**.\\n   - Select **TiVo service connection**.\\n\\n## Restart Your Device\\n1. Unplug your TiVo device from power for at least **10 seconds**.\\n2. Plug it back in',
    padding: '12345678901234',
  }),
  Messages.AnswerPart({
    textDelta:
      '.\\n3. Turn on the device using the power button. (Note: Restarting may take up to **15 minutes**.)\\n\\n## Deactivate and Reactivate TiVo\\n1. **For Series4 and newer DVRs:**\\n   - From the TiVo home screen',
    padding: '123456',
  }),
  Messages.AnswerPart({
    textDelta:
      ', go to **TiVo Central**.\\n   - Select **Settings & Messages**.\\n   - Choose **Account & System info**.\\n   - Select **Netflix Account information**.\\n   - Choose **Deactivate this device**.\\n\\n2. **For Series3 and older DVRs:**\\n   - From TiVo Central, select **Video On Demand**.\\n   - Choose **Netflix**',
    padding: '1234567890',
  }),
  Messages.AnswerPart({
    textDelta:
      '.\\n   - Select **Netflix Account Information**.\\n   - Choose **Deactivate this device**.\\n\\nAfter deactivation, launch Netflix again and enter your Netflix email and password to reactivate.\\n\\n## Additional Troubleshooting\\nIf you still cannot connect to Netflix:\\n- Check for any reported service outages.\\n- Ensure your',
    padding: '1234567890123456',
  }),
  Messages.AnswerPart({
    textDelta:
      ' modem and Internet service are functioning properly.\\n- If necessary, bypass your router by connecting your TiVo directly to the modem using an Ethernet cable to identify if the router is the issue.\\n\\nFollowing these steps should help resolve your Netflix connection issues with TiVo.',
    padding: '12345678901234567890',
  }),
  Messages.Citations([
    {
      id: '42.21238$https://coveodemo.atlassian.net/wiki/Space:TV/Page:2359302-29:0',
      title:
        'How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
      uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
      clickUri:
        'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359302/How+To+Resolve+Netflix+Connection+With+Tivo+on+XB+Family+Smart+TVs',
      permanentid:
        '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4',
      primaryId: 'JFDEQ5DYMJFWOU2XG43XS4KENUXDEMJSGM4C4ZDFMZQXK3DU',
      text: "Tivo can cause some problems with the Netflix App on your XBR6 Smart TV. Start by testing the Internet connection on your device To test the Internet connection on your TiVo, follow the steps below appropriate for your model. XBR6 Smart TV and XB Family of Smart TVs Step-by-step guide Series4 and newer DVRs Series3 and older DVRs From TiVo Central: 1. Select Settings & Messages 2. Select Settings 3. Select Network 4. Select View network diagnostics 5. Select Test Internet connection. From TiVo Central: 1. Select Messages & Settings 2. Select Settings 3. Select Phone & Network 4. Select View network diagnostics 5. Select TiVo service connection. Restart the device 1. Unplug your device from power for at least 10 seconds. 2. Plug your device back in. 3. Turn your device on with the power button. Note: All devices are different. Some may take up to 15 minutes to fully restart. Deactivate and reactivate your TiVo. To deactivate your TiVo, follow the steps below appropriate for your model. Series4 and newer DVRs Series3 and older DVRs From TiVo Central: 1. From the TiVo home screen, go to Tivo central 2. Choose Settings & Messages 3. Select Account & System info 4. Select Netflix Account information 5. Select deactivate this device From TiVo Central: 1. Select Video On Demand. 2. Select Netflix. 3. Select Netflix Account Information. 4. Select Deactivate this device. After you've deactivated your TiVo, launch Netflix again and enter your Netflix e-mail and password to reactivate. Troubleshoot",
      source: 'Coveo Sample - Confluence Cloud',
      fields: {
        filetype: 'html',
      },
    },
    {
      id: '42.21238$https://coveodemo.atlassian.net/wiki/Space:TV/Page:2359302-29:1',
      title:
        'How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
      uri: 'https://coveodemo.atlassian.net/wiki/TV/How To Resolve Netflix Connection With Tivo on XB Family Smart TVs',
      clickUri:
        'https://coveodemo.atlassian.net/wiki/spaces/TV/pages/2359302/How+To+Resolve+Netflix+Connection+With+Tivo+on+XB+Family+Smart+TVs',
      permanentid:
        '4c904bae6da41bf62ecb8e204a572b7f020b7bc0b277a77fc30b1a0f54c4',
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
      permanentid:
        '302ede92620f05146aa97d10eb07a9eba7a7baec23434214bd7c8887617a',
      primaryId: 'OJRE6RCIJV2VU2KLIRYDQUDINIXDEMJSGM4C4ZDFMZQXK3DU',
      text: "the problem by eliminating the router or wireless connectivity problems as a possible cause. 1. Turn off or unplug your smart TV. 2. Plug your smart TV directly into your modem using an Ethernet cable. 3. Unplug your modem from power for at least 30 seconds, then plug it back in and wait until no new indicator lights are blinking on. 4. Turn on your smart TV and attempt to stream again. If this step gets you streaming again through the Netflix App on your Besttech Smart TV: • If you've bypassed your router and successfully connected to Netflix directly through your modem, it's likely that the router itself is the source of the problem. • Bypassing the router will allow you to stream for now, but if this configuration isn't a perfect solution, you may want to contact whoever set up your home network for help resetting or re-configuring your router settings. If you're still not able to stream: • If you're connected directly to your modem and still can't stream Netflix, you may want to check with your equipment provider to make sure your modem and Internet service are functioning as intended. Related articles - Page: Brad Test Article - Page: Besttech XBR6 TV Specifications - Page: How To Resolve Netflix Connection With Tivo on XB Family Smart TVs - Page: How To Resolve Netflix Android Connection Error on XB, XBR, and XBR6 Smart TV - Page: How To Resolve Netflix Playback Errors on Besttech XB Smart TVs",
      source: 'Coveo Sample - Confluence Cloud',
      fields: {
        filetype: 'html',
      },
    },
  ]),
  Messages.EndOfStream,
];

const buildAnsweringStreamingResponse = (
  {
    messages = rgaMessages,
    delayBetweenMessages = 'real',
  }: {
    messages?: MessagePayloadStringified[];
    delayBetweenMessages?: number | 'real' | 'infinite';
  } = {messages: rgaMessages, delayBetweenMessages: 'real'}
) => {
  const stream = new ReadableStream({
    start(controller) {
      for (const message of messages) {
        controller.enqueue(
          new TextEncoder().encode(
            `event: message\ndata: ${JSON.stringify(message)}\nretry: 10000\n\n`
          )
        );
      }
      controller.close();
    },
  });

  // Introduce an artificial latency of 1s between each message
  const latencyStream = new TransformStream({
    start() {},
    async transform(chunk, controller) {
      await delay(delayBetweenMessages);
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
  rgaMessages,
  immediateBaseResponse,
  baseResponse,
  slowDelayedBaseResponse,
  buildAnsweringStreamingResponse,
};
