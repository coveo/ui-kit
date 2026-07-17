import {buildRoutedResponse} from './shared.js';
import {SearchApiResponse, type ConverseEvent} from '../events.js';

const searchApiResponse: ConverseEvent = SearchApiResponse({
  content: {
    totalCount: 9,
    totalCountFiltered: 9,
    duration: 57,
    indexDuration: 39,
    requestDuration: 53,
    searchUid: 'ed777199-75d3-4e48-b40f-699dc00d2bbb',
    pipeline: 'empty',
    apiVersion: 2,
    queryCorrections: [],
    index: 'barcasportsmcy01fvu-l56dsftu-Indexer-1-r65oq43natljouzp7wev7gcmfe',
    logicalIndex: 'default',
    indexRegion: 'us-east-1',
    indexToken:
      'YmFyY2FzcG9ydHNtY3kwMWZ2dS1sNTZkc2Z0dS1JbmRleGVyLTEtcjY1b3E0M25hdGxqb3V6cDd3ZXY3Z2NtZmU=',
    refinedKeywords: [],
    triggers: [],
    termsToHighlight: {
      boating: ['boat', 'boats'],
      safety: [],
    },
    phrasesToHighlight: {},
    groupByResults: [],
    facets: [
      {
        field: 'source',
        moreValuesAvailable: false,
        values: [
          {
            value: 'Sports - Blog',
            state: 'selected',
            numberOfResults: 9,
          },
          {
            value: 'Engineering',
            state: 'idle',
            numberOfResults: 531,
          },
          {
            value: 'Shopify',
            state: 'idle',
            numberOfResults: 1752,
          },
          {
            value: 'Sports',
            state: 'idle',
            numberOfResults: 87,
          },
          {
            value: 'Sports2026',
            state: 'idle',
            numberOfResults: 96,
          },
        ],
        indexScore: 0.1,
      },
      {
        field: 'objecttype',
        moreValuesAvailable: false,
        values: [
          {
            value: 'Article',
            state: 'idle',
            numberOfResults: 9,
          },
        ],
        indexScore: 0.27683487165581433,
        label: 'Object Type',
      },
      {
        field: 'filetype',
        moreValuesAvailable: false,
        values: [
          {
            value: 'html',
            state: 'idle',
            numberOfResults: 9,
          },
        ],
        indexScore: 0.2323437081741416,
      },
    ],
    suggestedFacets: [],
    categoryFacets: [],
    results: [
      {
        title:
          'How to Stay Afloat With Better Boating Gear – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        primaryid: 'NJDE45LBJTB3C3SRGNCXO6JQKRCC4MZSGA3TKLTEMVTGC5LMOQ',
        excerpt:
          'Boating is an activity that many people enjoy, however, it can also be dangerous. ... Good boat accessories can provide comfort, safety, and peace of mind when you’re out on the water.',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 4273,
        percentScore: 71.45878,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [
          {
            length: 7,
            offset: 31,
          },
        ],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 7,
            offset: 0,
          },
          {
            length: 4,
            offset: 91,
          },
          {
            length: 6,
            offset: 129,
          },
        ],
        printableUriHighlights: [
          {
            length: 7,
            offset: 73,
          },
        ],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'jFNuaLñnQ3Ewy0TD',
          urihash: 'jFNuaLñnQ3Ewy0TD',
          sysindexeddate: 1761049877000,
          permanentid:
            '344358cc4b190efa5f298b7393edce28745a74e03c286a489bac855cb95a',
          date: 1671730301000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049877583812600,
          syssource: 'Sports - Blog',
          sysdate: 1671730301000,
          primaryid: 'NJDE45LBJTB3C3SRGNCXO6JQKRCC4MZSGA3TKLTEMVTGC5LMOQ',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049877000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049877583812600,
        },
        Title:
          'How to Stay Afloat With Better Boating Gear – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/how-to-stay-afloat-with-better-boating-gear/',
        Excerpt:
          'Boating is an activity that many people enjoy, however, it can also be dangerous. ... Good boat accessories can provide comfort, safety, and peace of mind when you’re out on the water.',
        FirstSentences: null,
      },
      {
        title: 'Boat Accessories 101 – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        primaryid: 'KVGGCNSTINDFO2DJNZDGM6DKHAXDGMRQG42S4ZDFMZQXK3DU',
        excerpt:
          'Boating is a great way to have fun and spend time with friends and family, but it can be a hassle if ... Safety Equipment: Safety is always the first priority when it comes to boating, so it ...',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 4233,
        percentScore: 71.12353,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [
          {
            length: 4,
            offset: 0,
          },
        ],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 7,
            offset: 0,
          },
          {
            length: 6,
            offset: 105,
          },
          {
            length: 6,
            offset: 123,
          },
          {
            length: 7,
            offset: 176,
          },
        ],
        printableUriHighlights: [
          {
            length: 4,
            offset: 42,
          },
        ],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'ULa6SCFWhinFfxj8',
          urihash: 'ULa6SCFWhinFfxj8',
          sysindexeddate: 1761049883000,
          permanentid:
            'd634d8d7ef261255ebd8f8a18d65e4c47e56b914190bfb70320bc8fe4b65',
          date: 1671730440000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049883038782700,
          syssource: 'Sports - Blog',
          sysdate: 1671730440000,
          primaryid: 'KVGGCNSTINDFO2DJNZDGM6DKHAXDGMRQG42S4ZDFMZQXK3DU',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049883000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049883038782700,
        },
        Title: 'Boat Accessories 101 – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/boat-accessories-101/',
        Excerpt:
          'Boating is a great way to have fun and spend time with friends and family, but it can be a hassle if ... Safety Equipment: Safety is always the first priority when it comes to boating, so it ...',
        FirstSentences: null,
      },
      {
        title: 'Safety Guidelines For Your Towable Tube – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        primaryid: 'M5XGGN3VIZHTERLTMNLFGUDGN4XDGMRQG42S4ZDFMZQXK3DU',
        excerpt:
          'Safety Guidelines For Your Towable Tube When it comes to enjoying the summer, nothing ... Boat towable tubes are a great way to have some fun while also enjoying the scenery, but it’s ...',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 4104,
        percentScore: 70.0314,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [
          {
            length: 6,
            offset: 0,
          },
        ],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 6,
            offset: 0,
          },
          {
            length: 4,
            offset: 90,
          },
        ],
        printableUriHighlights: [
          {
            length: 6,
            offset: 42,
          },
        ],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'gnc7uFO2EscVSPfo',
          urihash: 'gnc7uFO2EscVSPfo',
          sysindexeddate: 1761049878000,
          permanentid:
            '1fea96a7471f7fce8a36e6ce5cc72ce9a48168628ce7792db0c45a1c7153',
          date: 1671730943000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049878317885400,
          syssource: 'Sports - Blog',
          sysdate: 1671730943000,
          primaryid: 'M5XGGN3VIZHTERLTMNLFGUDGN4XDGMRQG42S4ZDFMZQXK3DU',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049878000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049878317885400,
        },
        Title: 'Safety Guidelines For Your Towable Tube – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/safety-guidelines-for-your-towable-tube/',
        Excerpt:
          'Safety Guidelines For Your Towable Tube When it comes to enjoying the summer, nothing ... Boat towable tubes are a great way to have some fun while also enjoying the scenery, but it’s ...',
        FirstSentences: null,
      },
      {
        title: '5 Things To Know When Buying Boat Gear – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        primaryid: 'PFRTOY3TNB2HG6TFJFMEGNDCKUXDGMRQG42S4ZDFMZQXK3DU',
        excerpt:
          '... for accessories made from corrosion-resistant materials such as stainless steel, aluminum, and fiberglass. 4. Safety First. Safety should be your top priority when choosing boat accessories.',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 4079,
        percentScore: 69.81777,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [
          {
            length: 4,
            offset: 29,
          },
        ],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 6,
            offset: 114,
          },
          {
            length: 6,
            offset: 128,
          },
          {
            length: 4,
            offset: 177,
          },
        ],
        printableUriHighlights: [
          {
            length: 4,
            offset: 71,
          },
        ],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'yc7cshtszeIXC4bU',
          urihash: 'yc7cshtszeIXC4bU',
          sysindexeddate: 1761049875000,
          permanentid:
            '3a0b36771c5c572ee17630175af15fe1e59b992d9b0b27205e0aa32f1f49',
          date: 1671730626000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049875217494500,
          syssource: 'Sports - Blog',
          sysdate: 1671730626000,
          primaryid: 'PFRTOY3TNB2HG6TFJFMEGNDCKUXDGMRQG42S4ZDFMZQXK3DU',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049875000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049875217494500,
        },
        Title: '5 Things To Know When Buying Boat Gear – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/5-things-to-know-when-buying-boat-gear/',
        Excerpt:
          '... for accessories made from corrosion-resistant materials such as stainless steel, aluminum, and fiberglass. 4. Safety First. Safety should be your top priority when choosing boat accessories.',
        FirstSentences: null,
      },
      {
        title:
          'Water Sledding 101: Staying Safe in The Water – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        primaryid: 'MZDXKM2CMIYWM32SNREVERK2YOYC4MZSGA3TKLTEMVTGC5LMOQ',
        excerpt:
          'Boat towable tubes are a great way to laugh and splash with friends and family. ... hit the water, you should be aware of the proper safety precautions to take when using boat towable tubes.',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 3066,
        percentScore: 60.53064,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 4,
            offset: 0,
          },
          {
            length: 6,
            offset: 133,
          },
          {
            length: 4,
            offset: 171,
          },
        ],
        printableUriHighlights: [],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'fGu3Bb1foRlIREZð',
          urihash: 'fGu3Bb1foRlIREZð',
          sysindexeddate: 1761049875000,
          permanentid:
            '534d6d592006ab5d792dd0ba5eb0b3af03baf69638d61462c5ef5f70deb3',
          date: 1671730792000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049875164964900,
          syssource: 'Sports - Blog',
          sysdate: 1671730792000,
          primaryid: 'MZDXKM2CMIYWM32SNREVERK2YOYC4MZSGA3TKLTEMVTGC5LMOQ',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049875000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049875164964900,
        },
        Title:
          'Water Sledding 101: Staying Safe in The Water – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/water-sledding-101-staying-safe-in-the-water/',
        Excerpt:
          'Boat towable tubes are a great way to laugh and splash with friends and family. ... hit the water, you should be aware of the proper safety precautions to take when using boat towable tubes.',
        FirstSentences: null,
      },
      {
        title:
          'Make A Splash: Getting Ready For Paddle Sports – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        primaryid: 'GBGTG4LNKFLUM3TXOB5FISLJIIXDGMRQG42S4ZDFMZQXK3DU',
        excerpt:
          'Paddle sports require specific equipment to ensure your safety and comfort. ... flotation device, like a life jacket, as well as a paddle and a boat or board to get you out on the water.',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 2441,
        percentScore: 54.00986,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 6,
            offset: 56,
          },
          {
            length: 4,
            offset: 144,
          },
        ],
        printableUriHighlights: [],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: '0M3qmQWFnwpzTIiB',
          urihash: '0M3qmQWFnwpzTIiB',
          sysindexeddate: 1761049872000,
          permanentid:
            '5cc7cdd7f10bf34879e71c2d042a72a1d8c47182cd814a9ad65ffcd540c7',
          date: 1671731507000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049872581534700,
          syssource: 'Sports - Blog',
          sysdate: 1671731507000,
          primaryid: 'GBGTG4LNKFLUM3TXOB5FISLJIIXDGMRQG42S4ZDFMZQXK3DU',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049872000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049872581534700,
        },
        Title:
          'Make A Splash: Getting Ready For Paddle Sports – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/make-a-splash-getting-ready-for-paddle-sports/',
        Excerpt:
          'Paddle sports require specific equipment to ensure your safety and comfort. ... flotation device, like a life jacket, as well as a paddle and a boat or board to get you out on the water.',
        FirstSentences: null,
      },
      {
        title: 'The Past, Present and Future of Ski Tubes – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        primaryid: 'NBMHSOLGJRQ4HMLFKBWVCSSWGE4C4MZSGA3TKLTEMVTGC5LMOQ',
        excerpt:
          'Boat towable tubes, also known as towables, water tubes, or ski tubes, have become an increasingly ... basic, consisting of a tubular vinyl bag with a trigger safety valve and a tow rope.',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 2289,
        percentScore: 52.30125,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 4,
            offset: 0,
          },
          {
            length: 6,
            offset: 159,
          },
        ],
        printableUriHighlights: [],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'hXy9fLañePmQJV18',
          urihash: 'hXy9fLañePmQJV18',
          sysindexeddate: 1761049878000,
          permanentid:
            'd92b7d3e82c23e348ba49e0cb2da4e11817898e7353bcb4a8273a63f1cd4',
          date: 1671730858000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049878370705000,
          syssource: 'Sports - Blog',
          sysdate: 1671730858000,
          primaryid: 'NBMHSOLGJRQ4HMLFKBWVCSSWGE4C4MZSGA3TKLTEMVTGC5LMOQ',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049878000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049878370705000,
        },
        Title: 'The Past, Present and Future of Ski Tubes – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/the-past-present-and-future-of-ski-tubes/',
        Excerpt:
          'Boat towable tubes, also known as towables, water tubes, or ski tubes, have become an increasingly ... basic, consisting of a tubular vinyl bag with a trigger safety valve and a tow rope.',
        FirstSentences: null,
      },
      {
        title:
          '3 Dangers You’ll Encounter While Jet Skiing – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        primaryid: 'ORUGC2TDIR2FAY2JGI3GI32HPIXDGMRQG42S4ZDFMZQXK3DU',
        excerpt:
          '3 Dangers You’ll Encounter While Jet Skiing ... This means that you could be at risk of collisions with other boats, especially if you’re jet skiing in an area with a lot of boat traffic.',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 2224,
        percentScore: 51.55331,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 5,
            offset: 110,
          },
          {
            length: 4,
            offset: 174,
          },
        ],
        printableUriHighlights: [],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'thajcDtPcI26doGz',
          urihash: 'thajcDtPcI26doGz',
          sysindexeddate: 1761049878000,
          permanentid:
            '1cfc813acf9690f2e88cc64ef4782bd02fcf53953b5867c26e844cb1a27f',
          date: 1671734748000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049878625987800,
          syssource: 'Sports - Blog',
          sysdate: 1671734748000,
          primaryid: 'ORUGC2TDIR2FAY2JGI3GI32HPIXDGMRQG42S4ZDFMZQXK3DU',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049878000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049878625987800,
        },
        Title:
          '3 Dangers You’ll Encounter While Jet Skiing – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/3-dangers-youll-encounter-while-skiing/',
        Excerpt:
          '3 Dangers You’ll Encounter While Jet Skiing ... This means that you could be at risk of collisions with other boats, especially if you’re jet skiing in an area with a lot of boat traffic.',
        FirstSentences: null,
      },
      {
        title: 'A Wild Ride: The History of Water Slides – Barca Sports Blog',
        uri: 'https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        printableUri:
          'https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        clickUri:
          'https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        uniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        primaryid: 'NQ3G4YJZGAYEIVCCKRNHKNTMK4XDGMRQG42S4ZDFMZQXK3DU',
        excerpt:
          'Riders would sit in a small boat and slide down the trough, often accompanied by a rush of water from a ... They are also designed with safety in mind, with features such as padded walls and ...',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion;HasAllMetaDataStream',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 1981,
        percentScore: 48.655437,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [],
        firstSentencesHighlights: [],
        excerptHighlights: [
          {
            length: 4,
            offset: 28,
          },
          {
            length: 6,
            offset: 136,
          },
        ],
        printableUriHighlights: [],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'l6na900DTBTZu6lW',
          urihash: 'l6na900DTBTZu6lW',
          sysindexeddate: 1761049877000,
          permanentid:
            '97dd12209f36f16ed89e38c0e2b448939162501d70a22c7fe285d6f7487f',
          date: 1673321284000,
          objecttype: 'Article',
          sourcetype: 'Sitemap',
          rowid: 1761049877942424300,
          syssource: 'Sports - Blog',
          sysdate: 1673321284000,
          primaryid: 'NQ3G4YJZGAYEIVCCKRNHKNTMK4XDGMRQG42S4ZDFMZQXK3DU',
          source: 'Sports - Blog',
          syssourcetype: 'Sitemap',
          indexeddate: 1761049877000,
          filetype: 'html',
          sysfiletype: 'html',
          sysrowid: 1761049877942424300,
        },
        Title: 'A Wild Ride: The History of Water Slides – Barca Sports Blog',
        Uri: 'https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        PrintableUri:
          'https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        ClickUri:
          'https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        UniqueId:
          '42.32075$https://barca356.wordpress.com/2022/12/22/a-wild-ride-the-history-of-water-slides/',
        Excerpt:
          'Riders would sit in a small boat and slide down the trough, often accompanied by a rush of water from a ... They are also designed with safety in mind, with features such as padded walls and ...',
        FirstSentences: null,
      },
    ],
    extendedResults: {},
  },
});

const response7Events: ConverseEvent[] = buildRoutedResponse({
  routedEvent: searchApiResponse,
});

export {response7Events};
