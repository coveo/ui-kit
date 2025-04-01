import {Raw, Result} from '@coveo/headless';

export function buildMockResult(config: Partial<Result> = {}): Result {
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
    raw: buildMockRaw(),
    ...config,
  };
}

export function buildMockRaw(config: Partial<Raw> = {}): Raw {
  return {
    urihash: '',
    parents: '',
    sfid: '',
    sfparentid: '',
    sfinsertedbyid: '',
    documenttype: '',
    sfcreatedbyid: '',
    permanentid: '',
    date: 0,
    objecttype: '',
    sourcetype: '',
    sftitle: '',
    size: 0,
    sffeeditemid: '',
    clickableuri: '',
    sfcreatedby: '',
    source: '',
    collection: '',
    connectortype: '',
    filetype: '',
    sfcreatedbyname: '',
    sflikecount: 0,
    language: [],
    ...config,
  };
}
