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
        urihash: 'tivo-netflix-1',
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
        urihash: 'tivo-netflix-2',
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
        urihash: 'besttech-netflix-1',
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

// Predefined response scenarios for E2E testing
const shortAnswerMessages: MessagePayloadStringified[] = [
  Messages.Header,
  Messages.AnswerPart({textDelta: '', padding: '12345678901234567'}),
  Messages.AnswerPart({
    textDelta: '# Short Answer\n\nThis is a brief response.',
    padding: '1234567890123',
  }),
  Messages.Citations([
    {
      id: '42.21238$https://example.com-1:0',
      title: 'Example Document',
      uri: 'https://example.com/doc',
      clickUri: 'https://example.com/doc',
      permanentid: 'abc123',
      primaryId: 'PRIMARY1',
      text: 'Sample citation text.',
      source: 'Test Source',
      fields: {
        filetype: 'html',
        urihash: 'example123',
      },
    },
  ]),
  Messages.EndOfStream,
];

const noCitationsMessages: MessagePayloadStringified[] = [
  Messages.Header,
  Messages.AnswerPart({textDelta: '', padding: '12345678901234567'}),
  Messages.AnswerPart({
    textDelta:
      '# Answer Without Citations\n\nThis response has no citations attached.',
    padding: '1234567890123',
  }),
  Messages.EndOfStream,
];

const errorResponse = () =>
  buildAnsweringStreamingResponse({
    messages: [
      buildMessage({
        payloadType: 'genqa.errorMessageType',
        payload: {error: 'Service temporarily unavailable'},
        errorMessage: 'Service temporarily unavailable',
        statusCode: 503,
      }),
    ],
    delayBetweenMessages: 0,
  });

const shortAnswerResponse = () =>
  buildAnsweringStreamingResponse({
    messages: shortAnswerMessages,
    delayBetweenMessages: 0,
  });

const noCitationsResponse = () =>
  buildAnsweringStreamingResponse({
    messages: noCitationsMessages,
    delayBetweenMessages: 0,
  });

const answerWithBulletPointsMessages: MessagePayloadStringified[] = [
  Messages.Header,
  Messages.AnswerPart({textDelta: '#', padding: '12345678'}),
  Messages.AnswerPart({
    textDelta:
      ' Overview of Pine Wood\n\nPine wood comes from trees in the **Pinus** genus, which includes a variety of species known for their distinct characteristics.',
    padding: '12345',
  }),
  Messages.AnswerPart({
    textDelta:
      ' Pine is classified into two main groups: **soft pines** and **hard pines**.\n\n## Characteristics\n\n- **Density and Strength**: Pine wood exhibits a range of',
    padding: '1234567890123',
  }),
  Messages.AnswerPart({
    textDelta:
      ' density and strength properties. Some species, like Shortleaf Pine, can be as strong as Red Oak in certain aspects, while others are considerably weaker.\n',
    padding: '1234567890123456789',
  }),
  Messages.AnswerPart({
    textDelta:
      '- **Appearance**: The heartwood of pine is typically light reddish-brown, while the sapwood can be pale yellow to nearly white. The grain is usually straight',
    padding: '1234567890123456',
  }),
  Messages.AnswerPart({
    textDelta:
      ' with a medium, even texture.\n\n## Common Species\n\nSome notable species of pine include:\n- **Eastern White Pine** (Pinus strobus)\n- **Red Pine**',
    padding: '12345678',
  }),
  Messages.AnswerPart({
    textDelta:
      ' (Pinus resinosa)\n- **Sugar Pine** (Pinus lambertiana)\n- **Scots Pine** (Pinus sylvestris)\n\n## Uses\n\nPine wood is widely used in construction, furniture making',
    padding: '1234567890',
  }),
  Messages.AnswerPart({
    textDelta:
      ', and as pulpwood for paper production. It is valued for its workability and is often treated for durability in outdoor applications.\n\n## Workability and',
    padding: '12345678',
  }),
  Messages.AnswerPart({
    textDelta:
      ' Safety\n\nPine is generally easy to work with using both hand and machine tools. However, it can cause allergic reactions or asthma-like symptoms in some',
    padding: '12345678901',
  }),
  Messages.AnswerPart({
    textDelta:
      ' individuals when worked.\n\n## Sustainability\n\nPine species are often considered sustainable, with many not listed as endangered or threatened.',
    padding: '12345678901234',
  }),
  Messages.Citations([
    {
      id: '42.2876$https://www.wood-database.com/pine-wood-an-overall-guide/-49:0',
      title: 'Pine Wood: An Overall Guide | The Wood Database',
      uri: 'https://www.wood-database.com/pine-wood-an-overall-guide/',
      clickUri: 'https://www.wood-database.com/pine-wood-an-overall-guide/',
      permanentid:
        '946b2c773ea8fc4e04588ef493626e84c8108bd2d90dafdd41b59b8100c7',
      primaryId: 'OZSVFQ5RI54FOMDWG5BUIVTRKVQS4MRYG43C4ZDFMZQXK3DU',
      text: "Skip to content Home Wood Filter Articles About Menu Home Wood Filter Articles About Pine Wood: An Overall Guide Search Search by Eric Meier Pine is pine, right? Not quite. There's quite a range in density and strength when it comes to the Pinus genus. Take one of the species of southern yellow pine, Shortleaf Pine, for instance: it has strength properties that are roughly equivalent to Red Oak (with the notable exception of hardness)—and in some categories, such as compression strength parallel to the grain, the pine is actually stronger! Yet there are also a lot of types of pine that are considerably weaker, and while they certainly have a prominent place in the construction industry, by using all species interchangeably with the generic name \"pine,\" we create a very inaccurate picture of this interesting wood genus! It can help to know what you've really got, so let's go over some of the key types of pine seen today: The Soft Pines This group is characterized by pines with a low density, even grain, and a gradual earlywood to latewood transition. Species within this group can't be reliably separated from one another, but it can be helpful to recognize their features in order to distinguish them from the hard pines.There are three principal species of soft pine: Sugar Pine (Pinus lambertiana) Western White Pine (Pinus monticola) Eastern White Pine (Pinus strobus) Of the three, Eastern White Pine tends to have the finest texture (i.e., smallest diameter tracheids) and the",
      source: 'test jstpierre2 rga',
      fields: {
        filetype: 'html',
        urihash: 'wood-database-pine-1',
      },
    },
    {
      id: '42.2876$https://www.wood-database.com/red-pine/-26:0',
      title: 'Red Pine | The Wood Database (Softwood)',
      uri: 'https://www.wood-database.com/red-pine/',
      clickUri: 'https://www.wood-database.com/red-pine/',
      permanentid:
        '2cbc1c2cde8712b09d76fcd4cf1f921b2c6723b7ab4a4c49e100454e84c5',
      primaryId: 'GXB3CNJVOZBVORZYIF4FI52MJFDC4MRYG43C4ZDFMZQXK3DU',
      text: 'Skip to content Home Wood Filter Articles About Menu Home Wood Filter Articles About Red Pine Search Search Red Pine (Pinus resinosa) Common Name(s): Red Pine, Norway Pine Scientific Name: Pinus resinosa Distribution: Northeastern North America Tree Size: 65-100 ft (20-30 m) tall, 2-3 ft (.6-1 m) trunk diameter Average Dried Weight: 34 lbs/ft 3 (545 kg/m 3 ) Specific Gravity (Basic, 12% MC): .41, .55 Janka Hardness: 560 lbf (2,490 N) Modulus of Rupture: 11,000 lbf/in 2 (75.9 MPa) Elastic Modulus: 1,630,000 lbf/in 2 (11.24 GPa) Crushing Strength: 6,070 lbf/in 2 (41.9 MPa) Shrinkage: Radial: 3.8%, Tangential: 7.2%, Volumetric: 11.3%, T/R Ratio: 1.9 Color/Appearance: Heartwood is light reddish brown, sapwood is pale yellow to nearly white. Grain/Texture: Grain is straight, with a medium, even texture and a somewhat oily feel. Endgrain: Medium sized resin canals, numerous and evenly distributed, mostly solitary; earlywood to latewood transition fairly abrupt, color contrast medium; tracheid diameter medium-large. Rot Resistance: Heartwood is rated as moderately durable to non-durable regarding decay resistance. Red Pine is readily treated with preservatives and can thereafter be used in exterior applications such as posts or utility poles. Workability: Red Pine is easy to work with both hand and machine tools. Glues and finishes well, though excess resin can sometimes cause problems with its paint-holding ability. Odor: Red Pine has a distinct, resinous odor when being worked. Allergies/Toxicity: Working with pine has been reported to cause allergic skin reactions and/or asthma-like symptoms in some people. See the articles Wood Allergies',
      source: 'test jstpierre2 rga',
      fields: {
        filetype: 'html',
        urihash: 'wood-database-red-pine-1',
      },
    },
    {
      id: '42.2876$https://www.wood-database.com/red-pine/-26:1',
      title: 'Red Pine | The Wood Database (Softwood)',
      uri: 'https://www.wood-database.com/red-pine/',
      clickUri: 'https://www.wood-database.com/red-pine/',
      permanentid:
        '2cbc1c2cde8712b09d76fcd4cf1f921b2c6723b7ab4a4c49e100454e84c5',
      primaryId: 'GXB3CNJVOZBVORZYIF4FI52MJFDC4MRYG43C4ZDFMZQXK3DU',
      text: 'being worked. Allergies/Toxicity: Working with pine has been reported to cause allergic skin reactions and/or asthma-like symptoms in some people. See the articles Wood Allergies and Toxicity and Wood Dust Safety for more information. Pricing/Availability: Red Pine is sometimes mixed with various species of spruce, pine, and fir and is stamped with the lumber abbreviation "SPF." In this form, Red Pine should be widely available as construction lumber for a modest price. Sustainability: This wood species is not listed in the CITES Appendices, and is reported by the IUCN as being a species of least concern. Common Uses: Utility poles, posts, railroad ties, paper (pulpwood), and construction lumber. Comments: So called because of the tree\'s reddish-brown bark. Red Pine is the state tree of Minnesota. The alternate common name of "Norway Pine" is somewhat mystifying, as the tree did not originate from Norway, and there\'s no clear link with Norway. Some believe the name comes from early American explorers who confused the tree with Norway Spruce (Picea abies). Related Species: Austrian Pine (Pinus nigra) Caribbean Pine (Pinus caribaea) Eastern White Pine (Pinus strobus) Jack Pine (Pinus banksiana) Jeffrey Pine (Pinus jeffreyi) Khasi Pine (Pinus kesiya) Limber Pine (Pinus flexilis) Loblolly Pine (Pinus taeda) Lodgepole Pine (Pinus contorta) Longleaf Pine (Pinus palustris) Maritime Pine (Pinus pinaster) Ocote Pine (Pinus oocarpa) Patula Pine (Pinus patula) Pinyon Pine (Pinus edulis) Pitch Pine (Pinus rigida) Pond Pine (Pinus serotina) Ponderosa Pine (Pinus ponderosa) Radiata Pine (Pinus radiata) Sand Pine (Pinus clausa) Scots Pine (Pinus',
      source: 'test jstpierre2 rga',
      fields: {
        filetype: 'html',
        urihash: 'wood-database-red-pine-2',
      },
    },
  ]),
  Messages.EndOfStream,
];

const answerWithBulletPointsResponse = () =>
  buildAnsweringStreamingResponse({
    messages: answerWithBulletPointsMessages,
    delayBetweenMessages: 0,
  });

const answerWithCodeMessages: MessagePayloadStringified[] = [
  Messages.Header,
  Messages.AnswerPart({textDelta: '#', padding: '12345678'}),
  Messages.AnswerPart({
    textDelta:
      ' Implementing a Search Page Using Atomic\n\nTo implement a search page using Atomic, follow these steps:\n\n1. **Create Initialization Snippet**:\n Create a snippet named `initialize-search-page.liquid` to initialize the Atomic interface:\n ```liquid\n <script type="module">\n await window.loadAtomic();\n const engine = await window.configureHeadless();\n const searchPage = document.querySelector(\'#search-page\');\n await searchPage.initializeWith',
    padding: '123456789012345',
  }),
  Messages.AnswerPart({
    textDelta:
      "Engine(engine);\n searchPage.executeFirstRequest();\n </script>\n ```\n\n2. **Modify Theme Code**:\n Open your theme and locate the code that renders the search results page. In the Dawn theme, this is found in `sections/main-search.liquid`. Remove any existing search page code and add the following:\n ```liquid\n {% render 'engine' %}\n {% render 'atomic' %}\n {% render 'initialize-search-page' %}\n <atomic-commerce-interface",
    padding: '1234567890',
  }),
  Messages.AnswerPart({
    textDelta:
      ' id="search-page" type="search">\n <atomic-commerce-layout>\n <atomic-layout-section section="search">\n <atomic-commerce-search-box>\n <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>\n <atomic-commerce-search-box-query-suggestions></',
    padding: '1234567890123456789',
  }),
  Messages.AnswerPart({
    textDelta:
      'atomic-commerce-search-box-query-suggestions>\n <atomic-commerce-search-box-instant-products image-size="small">\n <atomic-product-template>\n <template>\n <atomic-product-section-name>\n <atomic-product-link></atomic-product-link>\n </atomic-product-section-name>\n <atomic-product-section',
    padding: '123456789012345',
  }),
  Messages.AnswerPart({
    textDelta:
      '-visual>\n <atomic-product-field-condition if-defined="ec_thumbnails">\n <atomic-product-image field="ec_thumbnails"></atomic-product-image>\n </atomic-product-field-condition>\n </',
    padding: '1234567890',
  }),
  Messages.AnswerPart({
    textDelta:
      'atomic-product-section-visual>\n <atomic-product-section-metadata>\n <atomic-product-field-condition if-defined="ec_brand">\n <atomic-product-text field="ec_brand"></atomic-product-text>\n </atomic-product-field-condition>\n <atomic-product-field-condition if-defined="ec_rating">\n <atomic-product-rating field="ec_rating"></atomic-product-rating>\n </atomic-product-field-condition>\n </atomic-product-section-metadata>\n <atomic-product-section-emphasized>\n <atomic-product-price',
    padding: '1234567890123456789',
  }),
  Messages.AnswerPart({
    textDelta:
      '></atomic-product-price>\n </atomic-product-section-emphasized>\n </template>\n </atomic-product-template>\n </atomic-commerce-search-box-instant-products>\n </atomic-commerce-search-box>\n </atomic-layout-section>\n <!-- Additional sections can be added',
    padding: '1234567890123456',
  }),
  Messages.Citations([
    {
      id: '42.19675$https://docs.coveo.com/en/oc2d1157/-41:4',
      title:
        'Build Atomic commerce interfaces without using the Coveo app for Shopify | Coveo for Commerce',
      uri: 'https://docs.coveo.com/en/oc2d1157/',
      clickUri: 'https://docs.coveo.com/en/oc2d1157/',
      permanentid:
        '38e81f28f95b5529ef4fdfee0072e22b29e3b211ea95a69f13a71ea7ddbb',
      primaryId: 'ME2UG42GI4YWG3BWONKGC53XJ4XDCOJWG42S4ZDFMZQXK3DU',
      text: 'To implement a Coveo Atomic search page or replace an existing search page with an Atomic one, do the following: Create a snippet named initialize-search-page.liquid to initialize the Atomic interface. <!-- snippets/initialize-search-page.liquid --> <script type="module"> await window.loadAtomic(); const engine = await window.configureHeadless(); const searchPage = document.querySelector(\'#search-page\'); await searchPage.initializeWithEngine(engine); searchPage.executeFirstRequest(); </script> Initialize the search page with the Coveo engine. The executeFirstRequest method sends the first query to the Coveo engine, ensuring the search page is populated with results when it loads. Open your theme and locate the code that renders the search results page. Note In the Dawn theme, this code is located in sections/main-search.liquid. Remove the existing search page code from this file, if any exists. Add the initialization snippets and an atomic-commerce-interface element of type search that includes the target Atomic search page components, as follows: <!--- sections/main-search.liquid ---> {% render \'engine\' %} {% render \'atomic\' %} {% render \'initialize-search-page\' %} <atomic-commerce-interface id="search-page" type="search"> <atomic-commerce-layout> <atomic-layout-section section="search"> <atomic-commerce-search-box> <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries> <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions> <atomic-commerce-search-box-instant-products image-size="small"> <atomic-product-template> <template> <atomic-product-section-name> <atomic-product-link></atomic-product-link> </atomic-product-section-name> <atomic-product-section-visual> <atomic-product-field-condition if-defined="ec_thumbnails"> <atomic-product-image field="ec_thumbnails"></atomic-product-image> </atomic-product-field-condition> </atomic-product-section-visual> <atomic-product-section-metadata> <atomic-product-field-condition if-defined="ec_brand"> <atomic-product-text field="ec_brand"></atomic-product-text> </atomic-product-field-condition> <atomic-product-field-condition if-defined="ec_rating"> <atomic-product-rating field="ec_rating"></atomic-product-rating> </atomic-product-field-condition> </atomic-product-section-metadata> <atomic-product-section-emphasized> <atomic-product-price></atomic-product-price>',
      source: 'Coveo Sample - Coveo Docs',
      fields: {
        filetype: 'html',
        urihash: 'coveo-docs-atomic-commerce-1',
      },
    },
    {
      id: '42.19675$https://docs.coveo.com/en/m9jd0351/-47:1',
      title: 'We-Retail example implementation | Coveo for Adobe',
      uri: 'https://docs.coveo.com/en/m9jd0351/',
      clickUri: 'https://docs.coveo.com/en/m9jd0351/',
      permanentid:
        'add86a789599c4ab2da20821fc4b6d7c199f0557d3c9d96c28bf9f2cd900',
      primaryId: 'JNBESN2WHFCWKOLFHBMUTQ5QKBNC4MJZGY3TKLTEMVTGC5LMOQ',
      text: 'search page. Implementation details and code This section provides general information on how the two search interfaces shown above were implemented. Details such as search interface styling are purposely omitted to focus on core implementation. Note The search interface code snippets in this section use Atomic v1 components. See Upgrade from v1 to v2 and Upgrade from v2 to v3 for instructions on making the code snippets compatible with Atomic v3. For the full-fledged Coveo atomic search page, a apps/weretail/components/content/searchresults component was created and included in the new page content. The component searchresults.html code is the following: <sly> <atomic-search-interface class="search-results-page"> <atomic-search-layout> <atomic-layout-section section="search"> <atomic-search-box></atomic-search-box> </atomic-layout-section> <atomic-layout-section section="facets"> <atomic-facet-manager> <atomic-facet field="source" label="Source"> </atomic-facet> <atomic-facet field="language" label="Language"> </atomic-facet> <atomic-timeframe-facet is-collapsed="true" label="Timeframe" with-date-picker="true"> <atomic-timeframe unit="hour"></atomic-timeframe> <atomic-timeframe unit="day"></atomic-timeframe> <atomic-timeframe unit="week"></atomic-timeframe> <atomic-timeframe unit="month"></atomic-timeframe> <atomic-timeframe unit="quarter"></atomic-timeframe> <atomic-timeframe unit="year"></atomic-timeframe> </atomic-timeframe-facet> </atomic-facet-manager> </atomic-layout-section> <atomic-layout-section section="main"> <atomic-layout-section section="status"> <atomic-breadbox></atomic-breadbox> <atomic-query-summary></atomic-query-summary> <atomic-refine-toggle></atomic-refine-toggle> <atomic-sort-dropdown> <atomic-sort-expression expression="relevancy descending" label="Relevance"> </atomic-sort-expression> <atomic-sort-expression expression="date descending" label="Date"> </atomic-sort-expression> </atomic-sort-dropdown> <atomic-did-you-mean></atomic-did-you-mean> </atomic-layout-section> <atomic-layout-section section="results"> <atomic-result-list density="compact" display="grid" image-size="icon"> <atomic-result-template> <template> <atomic-result-section-visual> <atomic-result-icon></atomic-result-icon> </atomic-result-section-visual> <atomic-result-section-badges> <atomic-result-badge field="language" ',
      source: 'Coveo Sample - Coveo Docs',
      fields: {
        filetype: 'html',
        urihash: 'coveo-docs-we-retail-1',
      },
    },
    {
      id: '42.19675$https://docs.coveo.com/en/2677/-64:3',
      title: 'Leverage the Coveo Atomic library | Coveo Platform',
      uri: 'https://docs.coveo.com/en/2677/',
      clickUri: 'https://docs.coveo.com/en/2677/',
      permanentid:
        '2f81d12e23bdf19f883e566abaf000372db3a660623f76487a31c790a1f3',
      primaryId: 'IFXEWWSIHB2GGSCXKNBDAZ2GHEXDCOJWG42S4ZDFMZQXK3DU',
      text: 'the examples in this section will be enclosed in <atomic-layout-section> elements. Create a search box A search box is a text input field from which queries can be submitted, and it\'s the centerpiece of most search interfaces. The atomic-search-box component comes with built-in support for QS. <atomic-layout-section section="search"> <atomic-search-box></atomic-search-box> </atomic-layout-section> This component adds a basic search box: Note You can also use Atomic to implement a standalone search box. Create a result list The atomic-result-list component displays query results using one or more result templates. <atomic-layout-section section="results"> <atomic-result-list></atomic-result-list> </atomic-layout-section> This component adds a basic result list: Atomic result lists are responsive. On windows that are under 1024px in width, the results are displayed as tiles: Customize the result list In the atomic-result-list component, you can set the display format, density, and image size of the result items. <atomic-result-list display="grid"></atomic-result-list> This presents the search results in a grid: Add sorting The atomic-sort-dropdown component adds a dropdown menu that lets the user reorder the result items according to a particular criterion. <atomic-layout-section section="status"> <!-- ... --> <atomic-sort-dropdown> <atomic-sort-expression label="relevance" expression="relevancy"></atomic-sort-expression> <atomic-sort-expression label="most-recent" expression="date descending"></atomic-sort-expression> </atomic-sort-dropdown> <!-- ... --> </atomic-layout-section> This component adds the following interface: Add pagination Atomic includes two pagination components, atomic-pager and atomic-load-more-results. The former lets the user navigate through different result pages, while the latter loads additional results if more are available. You can combine atomic-pager with the atomic-results-per-page component to let users control how many results they can see at a time. Pager <atomic-layout-section section="pagination"> <atomic-pager></atomic-pager> <atomic-results-per-page></atomic-results-per-page> </atomic-layout-section>',
      source: 'Coveo Sample - Coveo Docs',
      fields: {
        filetype: 'html',
        urihash: 'coveo-docs-atomic-library-1',
      },
    },
  ]),
  Messages.EndOfStream,
];

const answerWithCodeResponse = () =>
  buildAnsweringStreamingResponse({
    messages: answerWithCodeMessages,
    delayBetweenMessages: 0,
  });

const answerWithTableMessages: MessagePayloadStringified[] = [
  Messages.Header,
  Messages.AnswerPart({textDelta: '#', padding: '12345'}),
  Messages.AnswerPart({
    textDelta:
      ' Query Syntax Overview\n\nThe **Coveo query syntax** is a set of semantic rules designed to compose advanced queries for the Search API. It allows users to refine their queries using specific operators and is particularly useful for developers and system administrators.\n\n## Key Features\n\n- **Basic Queries**: Simple queries that can include terms, phrases, and logical operators.\n- **Field Queries**: Queries that target specific fields within the indexed documents',
    padding: '123456',
  }),
  Messages.AnswerPart({
    textDelta:
      '.\n- **Advanced Field Queries**: More complex queries that utilize advanced features of the syntax.\n- **General Query Extensions**: Additional capabilities that enhance query functionality.\n\n## Basic Query Examples\n\n| Query Syntax | Description |\n|-----------------------------|-------------------------------------------------------|\n| `term` | Returns all items containing the',
    padding: '12345678901',
  }),
  Messages.AnswerPart({
    textDelta:
      ' term. |\n| `term1 term2` | Returns all items containing both term1 and term2. |\n| `"term1 term2 term3"` | Returns all items containing the exact phrase. |\n| `\'term1 term2 term3\'` | Returns all items containing term1, term2, and term3.|\n| `[1] +term` |',
    padding: '12345678901',
  }),
  Messages.AnswerPart({
    textDelta:
      ' Returns all items containing exactly the term. |\n| `term1 AND term2` | Returns all items containing both term1 and term2. |\n| `term1 OR term2` | Returns all items containing either term1 or term2. |\n| `term1 NOT term2` | Returns all items containing term1 but not term',
    padding: '1234567890123',
  }),
  Messages.AnswerPart({
    textDelta:
      '2. |\n\n## Enabling Query Syntax\n\nBy default, the Coveo query syntax is disabled in the atomic-searchbox component. To enable it, set the `enable-query-syntax` attribute to **true**. When using the Search API directly, the query syntax is enabled by default. \n\nUnderstanding and utilizing the Coveo query syntax can significantly enhance the relevance and precision of search results.',
    padding: '12345678',
  }),
  Messages.Citations([
    {
      id: '42.19675$https://docs.coveo.com/en/1552/-38:0',
      title: 'Query syntax | Coveo Platform',
      uri: 'https://docs.coveo.com/en/1552/',
      clickUri: 'https://docs.coveo.com/en/1552/',
      permanentid:
        '64594c108fb8336eb626a2d85a7b867a9eaa4e5d35e79d343d2b95f30024',
      primaryId: 'JZTXAOCZJJFEOUSEJY3HMZCPMQXDCOJWG42S4ZDFMZQXK3DU',
      text: 'Query syntax Query syntax This is for: Developer System Administrator In this article Basic queries Field queries Advanced field queries General query extensions The Coveo query syntax is a set of semantic rules that can be used to compose advanced queries. In other words, it allows you to refine your queries using purpose-built operators. Although the Coveo query syntax is disabled by default in the atomic-searchbox component, it can be enabled by setting the enable-query-syntax attribute to true. When performing Search API calls directly, the query syntax is enabled by default. The following tables list examples of different Coveo query syntax features that can help build more relevant queries. These features often leverage special characters, so be sure to also read on using special characters in queries. Basic queries The following table lists examples of basic query syntax: query syntax example Search results term Returns all items containing term. term1 term2 Returns all items containing both term1 and term2. "term1 term2 term3" Returns all items containing the exact phrase between double quotes (see Searching for a phrase). \'term1 term2 term3\' Returns all items containing term1, term2, and term3. [1] +term Returns all items containing exactly term, not other words sharing the same root (see Searching for an exact term). term1 AND term2 Returns all items containing both term1 and term2 (see the AND operator). term1 OR term2 Returns all items containing either term1 or term2 (see the OR operator). term1 NOT term2 term1 -term2 Returns all items containing term1 but',
      source: 'Coveo Sample - Coveo Docs',
      fields: {
        filetype: 'html',
        urihash: 'coveo-docs-query-syntax-1',
      },
    },
    {
      id: '42.19675$https://docs.coveo.com/en/181/-97:0',
      title: 'Coveo query syntax | Coveo Glossary',
      uri: 'https://docs.coveo.com/en/181/',
      clickUri: 'https://docs.coveo.com/en/181/',
      permanentid:
        '2a3317108ab31ca46ec88d2537c60875187a550e70ee64518c2404541a71',
      primaryId: 'KFVUU2SOGJZXS5DQNREDAWCIIUXDCOJWG42S4ZDFMZQXK3DU',
      text: 'Coveo query syntax Synonyms: query syntax The Coveo query syntax is a set of semantic rules that can be used to compose advanced queries to send to the Search API. For more information, see: Query syntax',
      source: 'Coveo Sample - Coveo Docs',
      fields: {
        filetype: 'html',
        urihash: 'coveo-docs-query-syntax-glossary-1',
      },
    },
    {
      id: '42.19675$https://docs.coveo.com/en/1160/-46:0',
      title: 'Coveo query syntax examples | Coveo for Salesforce',
      uri: 'https://docs.coveo.com/en/1160/',
      clickUri: 'https://docs.coveo.com/en/1160/',
      permanentid:
        '0f1b8b0e382139ddcb0b47a81e579a1bb078a33936320fb02882c82227de',
      primaryId: 'NFITOWSGLJFEOUSEJZVVAN2BN4XDCOJWG42S4ZDFMZQXK3DU',
      text: "Coveo query syntax examples Coveo query syntax examples This is for: Developer System Administrator In this article Coveo for Salesforce uses the standard Coveo query syntax to build simple to complex queries (see Coveo Query Syntax Reference). While this syntax can be used by end users in the search box itself - as long as you have not disabled the query syntax on your search page (see Querybox - enableQuerySyntax) - it's most useful when developing search pages, to easily inject complex queries. On top of the usual Coveo query syntax, Coveo for Salesforce also allows you to use the Query extension language (see Query extension language), which works with the Coveo Search API instead of the Coveo index. There are two main ways where you can use this syntax to modify a query: server-side and client-side. Server-side filtering is preferred when users shouldn't access certain documents from your index, as it's more secure and prevents users from removing the filtering. Client-side filtering is preferred when you want to filter documents for relevance purposes, but when all documents should normally be available to them. Reference The following articles can help you build complex and powerful queries for your search page: Coveo Query Syntax Reference Query extension language Standard query extensions Where to use it There are two main ways where you can enter such queries: through the token or client-side. Token filtering is preferred when users shouldn't directly access certain documents from your index. Client-side filtering is preferred when you",
      source: 'Coveo Sample - Coveo Docs',
      fields: {
        filetype: 'html',
        urihash: 'coveo-docs-query-syntax-examples-1',
      },
    },
  ]),
  Messages.EndOfStream,
];

const answerWithTableResponse = () =>
  buildAnsweringStreamingResponse({
    messages: answerWithTableMessages,
    delayBetweenMessages: 0,
  });

const comprehensiveAnswerMessages: MessagePayloadStringified[] = [
  Messages.Header,
  Messages.AnswerPart({textDelta: '#', padding: '12345678'}),
  Messages.AnswerPart({
    textDelta:
      ' Getting Started with Atomic Components\n\nAtomic components provide a modern way to build search interfaces. Here are the key concepts:\n\n## Core Features\n\n- **Declarative Syntax**: Use HTML-like tags to define your interface\n- **Built-in State Management**: Automatic handling of search state\n- **Customizable Styling**: Full control over appearance',
    padding: '1234567890',
  }),
  Messages.AnswerPart({
    textDelta:
      '\n- **Responsive Design**: Mobile-first approach\n\n## Quick Start Example\n\nTo create a basic search interface, add this code:\n\n```html\n<atomic-search-interface>\n  <atomic-search-box></atomic-search-box>\n  <atomic-result-list></atomic-result-list>\n</atomic-search-interface>\n```\n\n## Component Options\n\n| Component | Purpose | Required',
    padding: '123456789012',
  }),
  Messages.AnswerPart({
    textDelta:
      ' |\n|--------------------------|----------------------------------|----------|\n| `atomic-search-box` | Search input field | Yes |\n| `atomic-result-list` | Display results | Yes |\n| `atomic-facet` | Filter results | No |\n| `atomic-sort-dropdown` | Sort options | No |\n\nThis provides a foundation for building powerful search experiences.',
    padding: '12345678901234',
  }),
  Messages.Citations([
    {
      id: '42.19675$https://docs.coveo.com/en/atomic-start/-1:0',
      title: 'Getting Started with Atomic | Coveo Platform',
      uri: 'https://docs.coveo.com/en/atomic-start/',
      clickUri: 'https://docs.coveo.com/en/atomic-start/',
      permanentid: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
      primaryId: 'ATOMIC1START2GUIDE3EXAMPLE4COMPONENT5DEMO',
      text: 'Getting started with Atomic components for building modern search interfaces. This guide covers basic setup, component usage, and best practices for creating responsive search experiences.',
      source: 'Coveo Sample - Coveo Docs',
      fields: {
        filetype: 'html',
        urihash: 'coveo-docs-atomic-start-1',
      },
    },
  ]),
  Messages.EndOfStream,
];

const comprehensiveAnswerResponse = () =>
  buildAnsweringStreamingResponse({
    messages: comprehensiveAnswerMessages,
    delayBetweenMessages: 0,
  });

export {
  rgaMessages,
  shortAnswerMessages,
  noCitationsMessages,
  answerWithBulletPointsMessages,
  answerWithCodeMessages,
  answerWithTableMessages,
  comprehensiveAnswerMessages,
  immediateBaseResponse,
  baseResponse,
  slowDelayedBaseResponse,
  errorResponse,
  shortAnswerResponse,
  noCitationsResponse,
  answerWithBulletPointsResponse,
  answerWithCodeResponse,
  answerWithTableResponse,
  comprehensiveAnswerResponse,
  buildAnsweringStreamingResponse,
};
