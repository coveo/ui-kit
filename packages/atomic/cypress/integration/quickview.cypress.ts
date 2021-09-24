import {
  buildQuickview,
  buildSearchEngine,
  Result,
  getSampleSearchEngineConfiguration,
  Raw,
} from '@coveo/headless';
import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('quickview', () => {
  it('#fetchResultContent logs the correct analytics event', () => {
    const engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });

    const raw = buildRaw({urihash: 'ñvgyuDzH6CY2agð3'});
    const result = buildResult({
      uniqueId:
        '42.38254$https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
      title:
        '2020 Customer Awards: United States Postal Service - Keep Calm and Carry On',
      uri: 'https://community.lithium.com/community:lithosphere/category:litho/category:customerawards/board:kudosawards2020/thread:600865/message:600865',
      clickUri:
        'https://community.khoros.com/t5/Khoros-Kudos-Awards-2020/2020-Customer-Awards-United-States-Postal-Service-Keep-Calm-and/cns-p/600865',
      raw,
    });
    const quickview = buildQuickview(engine, {options: {result}});

    setupIntercept();

    quickview.fetchResultContent();

    cy.wait(RouteAlias.analytics).then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property(
        'actionCause',
        'documentQuickview'
      );
    });
  });
});

function buildResult(config: Partial<Result>): Result {
  return {
    title: '',
    uri: '',
    printableUri: '',
    clickUri: '',
    uniqueId: '',
    excerpt: '',
    firstSentences: '',
    summary: null,
    flags: '',
    hasHtmlVersion: false,
    score: 0,
    percentScore: 0,
    rankingInfo: null,
    isTopResult: false,
    isRecommendation: false,
    titleHighlights: [],
    firstSentencesHighlights: [],
    excerptHighlights: [],
    printableUriHighlights: [],
    summaryHighlights: [],
    absentTerms: [],
    raw: buildRaw(),
    ...config,
  };
}

function buildRaw(config: Partial<Raw> = {}): Raw {
  return {
    urihash: '',
    ...config,
  };
}
