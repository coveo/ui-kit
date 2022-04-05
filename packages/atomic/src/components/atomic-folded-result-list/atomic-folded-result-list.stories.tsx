import {html} from 'lit-html';
import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/FoldedResultList',
  'atomic-folded-result-list',
  {},
  {
    engineConfig: {
      search: {
        preprocessSearchResponseMiddleware: (response) => {
          response.body.results[0] = resultWithChildren;
          return response;
        },
      },
    },
    additionalChildMarkup: () => html`
      <atomic-result-template>
        <template>
          <atomic-result-link></atomic-result-link>
          <div style="padding-left: 15px; margin-top: 20px;">
            <atomic-result-children>
              <b slot="before-children">Replies:</b>
              <atomic-result-children-template>
                <template>
                  <atomic-result-link></atomic-result-link>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </div>
        </template>
      </atomic-result-template>
    `,
  }
);

const resultWithChildren = {
  title:
    '2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
  uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
  printableUri:
    'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
  clickUri:
    'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cns-p/600865',
  uniqueId:
    '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
  excerpt:
    'The United States Postal Service (USPS) is the world’s largest postal service and is the second oldest government department in the US. ... We deliver 47% of the world’s mail. ... USPS is an essent...',
  firstSentences: null,
  summary: null,
  flags: 'HasHtmlVersion',
  hasHtmlVersion: true,
  hasMobileHtmlVersion: false,
  score: 15554,
  percentScore: 100,
  rankingInfo: null,
  rating: 0,
  isTopResult: false,
  isRecommendation: false,
  isUserActionView: false,
  titleHighlights: [],
  firstSentencesHighlights: [],
  excerptHighlights: [],
  printableUriHighlights: [],
  summaryHighlights: [],
  parentResult: null,
  childResults: [
    {
      title:
        'Re: 2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
      uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625329',
      printableUri:
        'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625329',
      clickUri:
        'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cnc-p/625329#M177',
      uniqueId:
        '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625329',
      excerpt:
        'Re: 2020 Customer Awards: United States Postal Service - Keep Calm and Carry On ... Best story EVER. #USPS rocks!',
      firstSentences: null,
      summary: null,
      flags: 'HasHtmlVersion',
      hasHtmlVersion: true,
      hasMobileHtmlVersion: false,
      score: 15554,
      percentScore: 100,
      rankingInfo: null,
      rating: 0,
      isTopResult: false,
      isRecommendation: false,
      isUserActionView: false,
      titleHighlights: [],
      firstSentencesHighlights: [],
      excerptHighlights: [],
      printableUriHighlights: [],
      summaryHighlights: [],
      parentResult: {
        title:
          '2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
        uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        printableUri:
          'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        clickUri:
          'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cns-p/600865',
        uniqueId:
          '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        excerpt:
          'The United States Postal Service (USPS) is the world’s largest postal service and is the second oldest government department in the US. ... We deliver 47% of the world’s mail. ... USPS is an essent...',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 0,
        percentScore: 0,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [],
        firstSentencesHighlights: [],
        excerptHighlights: [],
        printableUriHighlights: [],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'ñvgyuDzH6CY2agð3',
          urihash: 'ñvgyuDzH6CY2agð3',
          parents:
            '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /></parents>',
          permanentid:
            'b7117078f255e4a6a43fbdddc203c1faaee46f195b5459ce1dba54ed9e9f',
          syslanguage: ['English'],
          date: 1596464467000,
          objecttype: 'Message',
          foldingcollection:
            '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
          sourcetype: 'Lithium',
          syssource: 'Coveo Sample - Lithium Community',
          sysdate: 1596464467000,
          sysparents:
            '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /></parents>',
          foldingchild: [
            '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
          ],
          source: 'Coveo Sample - Lithium Community',
          collection: 'default',
          syssourcetype: 'Lithium',
          filetype: 'lithiummessage',
          sysfiletype: 'lithiummessage',
          language: ['English'],
          syscollection: 'default',
        },
        Title:
          '2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
        Uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        PrintableUri:
          'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        ClickUri:
          'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cns-p/600865',
        UniqueId:
          '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        Excerpt:
          'The United States Postal Service (USPS) is the world’s largest postal service and is the second oldest government department in the US. ... We deliver 47% of the world’s mail. ... USPS is an essent...',
        FirstSentences: null,
      },
      childResults: [],
      totalNumberOfChildResults: 0,
      absentTerms: [],
      raw: {
        sysurihash: 'NKDbmpJPnNBWlPc0',
        urihash: 'NKDbmpJPnNBWlPc0',
        parents:
          '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="re: 2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cnc-p/625329#m177" /></parents>',
        permanentid:
          '29bcabe092a74ebcdbd1c7c71b2a3bb3f07f2d96143c79e9441472ca8ae6',
        syslanguage: ['English'],
        date: 1613563974000,
        objecttype: 'Message',
        foldingcollection:
          '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
        sourcetype: 'Lithium',
        syssource: 'Coveo Sample - Lithium Community',
        sysdate: 1613563974000,
        sysparents:
          '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="re: 2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cnc-p/625329#m177" /></parents>',
        source: 'Coveo Sample - Lithium Community',
        collection: 'default',
        syssourcetype: 'Lithium',
        filetype: 'lithiummessage',
        sysfiletype: 'lithiummessage',
        language: ['English'],
        foldingparent:
          '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
        syscollection: 'default',
      },
      Title:
        'Re: 2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
      Uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625329',
      PrintableUri:
        'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625329',
      ClickUri:
        'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cnc-p/625329#M177',
      UniqueId:
        '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625329',
      Excerpt:
        'Re: 2020 Customer Awards: United States Postal Service - Keep Calm and Carry On ... Best story EVER. #USPS rocks!',
      FirstSentences: null,
    },
    {
      title:
        'Re: 2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
      uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625374',
      printableUri:
        'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625374',
      clickUri:
        'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cnc-p/625374#M178',
      uniqueId:
        '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625374',
      excerpt: 'Oh thank you so much!',
      firstSentences: null,
      summary: null,
      flags: 'HasHtmlVersion',
      hasHtmlVersion: true,
      hasMobileHtmlVersion: false,
      score: 15554,
      percentScore: 100,
      rankingInfo: null,
      rating: 0,
      isTopResult: false,
      isRecommendation: false,
      isUserActionView: false,
      titleHighlights: [],
      firstSentencesHighlights: [],
      excerptHighlights: [],
      printableUriHighlights: [],
      summaryHighlights: [],
      parentResult: {
        title:
          '2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
        uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        printableUri:
          'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        clickUri:
          'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cns-p/600865',
        uniqueId:
          '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        excerpt:
          'The United States Postal Service (USPS) is the world’s largest postal service and is the second oldest government department in the US. ... We deliver 47% of the world’s mail. ... USPS is an essent...',
        firstSentences: null,
        summary: null,
        flags: 'HasHtmlVersion',
        hasHtmlVersion: true,
        hasMobileHtmlVersion: false,
        score: 0,
        percentScore: 0,
        rankingInfo: null,
        rating: 0,
        isTopResult: false,
        isRecommendation: false,
        isUserActionView: false,
        titleHighlights: [],
        firstSentencesHighlights: [],
        excerptHighlights: [],
        printableUriHighlights: [],
        summaryHighlights: [],
        parentResult: null,
        childResults: [],
        totalNumberOfChildResults: 0,
        absentTerms: [],
        raw: {
          sysurihash: 'ñvgyuDzH6CY2agð3',
          urihash: 'ñvgyuDzH6CY2agð3',
          parents:
            '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /></parents>',
          permanentid:
            'b7117078f255e4a6a43fbdddc203c1faaee46f195b5459ce1dba54ed9e9f',
          syslanguage: ['English'],
          date: 1596464467000,
          objecttype: 'Message',
          foldingcollection:
            '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
          sourcetype: 'Lithium',
          syssource: 'Coveo Sample - Lithium Community',
          sysdate: 1596464467000,
          sysparents:
            '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /></parents>',
          foldingchild: [
            '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
          ],
          source: 'Coveo Sample - Lithium Community',
          collection: 'default',
          syssourcetype: 'Lithium',
          filetype: 'lithiummessage',
          sysfiletype: 'lithiummessage',
          language: ['English'],
          syscollection: 'default',
        },
        Title:
          '2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
        Uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        PrintableUri:
          'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        ClickUri:
          'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cns-p/600865',
        UniqueId:
          '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
        Excerpt:
          'The United States Postal Service (USPS) is the world’s largest postal service and is the second oldest government department in the US. ... We deliver 47% of the world’s mail. ... USPS is an essent...',
        FirstSentences: null,
      },
      childResults: [],
      totalNumberOfChildResults: 0,
      absentTerms: [],
      raw: {
        sysurihash: '1igjPjrJJLC87hNm',
        urihash: '1igjPjrJJLC87hNm',
        parents:
          '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="re: 2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cnc-p/625374#m178" /></parents>',
        permanentid:
          'b7fb6927cccc58b261a1f3a8c39b45a4bdb1a76c3a4fa8f69625a6e47ed8',
        syslanguage: ['English'],
        date: 1613575566000,
        objecttype: 'Message',
        foldingcollection:
          '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
        sourcetype: 'Lithium',
        syssource: 'Coveo Sample - Lithium Community',
        sysdate: 1613575566000,
        sysparents:
          '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="re: 2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cnc-p/625374#m178" /></parents>',
        source: 'Coveo Sample - Lithium Community',
        collection: 'default',
        syssourcetype: 'Lithium',
        filetype: 'lithiummessage',
        sysfiletype: 'lithiummessage',
        language: ['English'],
        foldingparent:
          '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
        syscollection: 'default',
      },
      Title:
        'Re: 2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
      Uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625374',
      PrintableUri:
        'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625374',
      ClickUri:
        'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cnc-p/625374#M178',
      UniqueId:
        '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:625374',
      Excerpt: 'Oh thank you so much!',
      FirstSentences: null,
    },
  ],
  totalNumberOfChildResults: 6,
  absentTerms: [],
  raw: {
    sysurihash: 'ñvgyuDzH6CY2agð3',
    urihash: 'ñvgyuDzH6CY2agð3',
    parents:
      '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /></parents>',
    permanentid: 'b7117078f255e4a6a43fbdddc203c1faaee46f195b5459ce1dba54ed9e9f',
    syslanguage: ['English'],
    date: 1596464467000,
    objecttype: 'Message',
    foldingcollection:
      '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
    sourcetype: 'Lithium',
    syssource: 'Coveo Sample - Lithium Community',
    sysdate: 1596464467000,
    sysparents:
      '<?xml version="1.0" encoding="utf-16"?><parents><parent name="atlas" uri="https://community.khoros.com/" /><parent name="atlas resources &amp; news" uri="https://community.khoros.com/t5/atlas-resources-news/ct-p/litho" /><parent name="khoros kudos awards" uri="https://community.khoros.com/t5/khoros-kudos-awards/ct-p/customerawards" /><parent name="kudos awards 2020" uri="https://community.khoros.com/t5/kudos-awards-2020/con-p/kudosawards2020" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /><parent name="2020 customer awards: united states postal service - keep calm and carry on" uri="https://community.khoros.com/t5/kudos-awards-2020/2020-customer-awards-united-states-postal-service-keep-calm-and/cns-p/600865" /></parents>',
    foldingchild: [
      '5472b0b3262e4a96f93451ebdc555d4227e4e69ea151e7027557c51169da',
    ],
    source: 'Coveo Sample - Lithium Community',
    collection: 'default',
    syssourcetype: 'Lithium',
    filetype: 'lithiummessage',
    sysfiletype: 'lithiummessage',
    language: ['English'],
    syscollection: 'default',
  },
  Title:
    '2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
  Uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
  PrintableUri:
    'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
  ClickUri:
    'https://community.khoros.com/t5/Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cns-p/600865',
  UniqueId:
    '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
  Excerpt:
    'The United States Postal Service (USPS) is the world’s largest postal service and is the second oldest government department in the US. ... We deliver 47% of the world’s mail. ... USPS is an essent...',
  FirstSentences: null,
};
export default defaultModuleExport;
export const DefaultFoldedResultList = exportedStory;
