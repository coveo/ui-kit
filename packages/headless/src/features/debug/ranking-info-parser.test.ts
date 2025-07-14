import {parseRankingInfo} from './ranking-info-parser.js';

function createRankingInfoNoKeywords() {
  return `Document weights:
  Title: 0; Quality: 180; Date: 405; Adjacency: 0; Source: 500; Custom: 400; Collaborative rating: 0; QRE: 890; Ranking functions: 0;

  Total weight: 2375`;
}

function createRankingInfoWithKeywords() {
  return 'Document weights:\nTitle: 800; Quality: 180; Date: 101; Adjacency: 0; Source: 500; Custom: 350; Collaborative rating: 0; QRE: 2500; Ranking functions: 0; \n\nTerms weights:\ntest: 100, 26; \nTitle: 800; Concept: 0; Summary: 300; URI: 500; Formatted: 0; Casing: 0; Relation: 200; Frequency: 1744; \n\nTotal weight: 7975';
}

function createRankingInfoWithQRE() {
  return 'Document weights:\nTitle: 0; Quality: 180; Date: 0; Adjacency: 0; Source: 500; Custom: 350; Collaborative rating: 0; QRE: 2500; Ranking functions: 0; \nQRE:\nExpression: "@permanentid=95ad18de4cb8e17023f0224e9d44dd2f7177c6dceac6cb81b16f3659a3c3" Score: 2500\nExpression: "@permanentid=4119a14f02a63d0c2d92b51d4501dd83580831caea327179934dd1bc6645" Score: 0\nExpression: "@permanentid=39ce64557bee624c368c6cfe736787f1dd22667f43a9f3e46fafa67158d6" Score: -1000\nExpression: "@permanentid=0d4e5fe9dca91c13d9de061c0c00d1a2733e0a1c0e198c588c2b93cfcd25" Score: 0\nExpression: "@permanentid=c612db560ef1f77316b6c11fbedfa3e9b728e09859a188639911aef9e6ea" Score: 0\nRanking Functions:\n\nTotal weight: 3530';
}

describe('ranking info parser', () => {
  it('should not throw on null', () => {
    expect(() => parseRankingInfo(null!)).not.toThrow();
  });

  it('should parse ranking info with no keywords', () => {
    const toParse = createRankingInfoNoKeywords();

    const parsed = parseRankingInfo(toParse)!;
    expect(parsed.totalWeight).toBe(2375);
    expect(parsed.documentWeights?.Adjacency).toBe(0);
    expect(parsed.documentWeights?.['Collaborative rating']).toBe(0);
    expect(parsed.documentWeights?.Custom).toBe(400);
    expect(parsed.documentWeights?.Date).toBe(405);
    expect(parsed.documentWeights?.QRE).toBe(890);
    expect(parsed.documentWeights?.Quality).toBe(180);
    expect(parsed.documentWeights?.['Ranking functions']).toBe(0);
    expect(parsed.documentWeights?.Source).toBe(500);
    expect(parsed.documentWeights?.Title).toBe(0);
    expect(parsed.termsWeight).toBeNull();
  });

  it('should parse ranking info properly with keywords', () => {
    const toParse = createRankingInfoWithKeywords();

    const parsed = parseRankingInfo(toParse)!;
    const testsTermsWeights = parsed.termsWeight?.test;

    expect(testsTermsWeights?.Weights?.Title).toBe(800);
    expect(testsTermsWeights?.Weights?.Concept).toBe(0);
    expect(testsTermsWeights?.Weights?.Summary).toBe(300);
    expect(testsTermsWeights?.Weights?.URI).toBe(500);
    expect(testsTermsWeights?.Weights?.Formatted).toBe(0);
    expect(testsTermsWeights?.Weights?.Casing).toBe(0);
    expect(testsTermsWeights?.Weights?.Relation).toBe(200);
    expect(testsTermsWeights?.Weights?.Frequency).toBe(1744);
    expect(testsTermsWeights?.terms.test['TF-IDF']).toBe(26);
    expect(testsTermsWeights?.terms.test.Correlation).toBe(100);
  });

  it('should parse ranking info properly with QRE', () => {
    const toParse = createRankingInfoWithQRE();

    const parsed = parseRankingInfo(toParse)!;

    expect(parsed.qreWeights[0].score).toBe(2500);
    expect(parsed.qreWeights[0].expression).toBe(
      'Expression: "@permanentid=95ad18de4cb8e17023f0224e9d44dd2f7177c6dceac6cb81b16f3659a3c3"'
    );
    expect(parsed.qreWeights[1].score).toBe(-1000);
    expect(parsed.qreWeights[1].expression).toBe(
      'Expression: "@permanentid=39ce64557bee624c368c6cfe736787f1dd22667f43a9f3e46fafa67158d6"'
    );
    expect(parsed.qreWeights.length).toBe(2);
  });

  it('should parse ranking info properly with no QRE', () => {
    const toParse = createRankingInfoNoKeywords();

    const parsed = parseRankingInfo(toParse)!;
    expect(parsed.qreWeights.length).toBe(0);
  });
});
