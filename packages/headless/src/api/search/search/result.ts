import {HighlightKeyword} from '../../../utils/highlight';
import {Raw} from './raw';

export interface Result {
  /**
   * Contains the title of the item.
   */
  title: string;

  /**
   * The item URI.
   * Notes: Avoid using the uri value to create hyperlinks to the item. Use the clickUri value instead.
   *
   * @example
   * https://example.com/Root:0/topic:898/post:2
   */
  uri: string;

  /**
   * The human readable item URI.
   * Note: Avoid using the printableUri value to create hyperlinks to the item. Use the clickUri value instead.
   *
   * @example
   * https://example.com/topic:898/post:2
   */
  printableUri: string;

  /**
   * The hyperlinkable item URI.
   * Notes: Use the clickUri value when you want to create hyperlinks to the item, rather than the uri or printableUri value.
   *
   * @example
   * https://example.com/t/1/898/2
   */
  clickUri: string;

  /**
   * The unique item identifier. You should consider the uniqueId value as an opaque string.
   *
   * @example
   * 84.72597$https://example.com/Root:0/Topic:898/Post:2
   */
  uniqueId: string;

  /**
   * The contextual excerpt generated for the item (see the excerptLength query parameter).
   *
   * @example
   * ... the new Coveo Cloud V2 and Coveo Cloud V1 ... the main differences between the two Coveo Cloud versions ...
   */
  excerpt: string;

  /**
   * The first sentences retrieved from the item (see the retrieveFirstSentences query parameter).
   *
   * @example
   * Hello, I know Coveo currently hosts organizations in two independent cloud platforms, the new Coveo Cloud V2 and Coveo Cloud V1, the original Coveo offering in the cloud. I would like to learn the main differences between the two Coveo Cloud versions ...
   */
  firstSentences: string;

  /**
   * The item summary (see the summaryLength query parameter).
   *
   * @example
   * Document
   */
  summary: null;

  /**
   * The flags that are set on the item by the index. Distinct values are separated by semicolons.
   *
   * @example
   * HasHtmlVersion;HasMobileHtmlVersion
   */
  flags: string;

  /**
   * Whether the index contains an HTML version of this item.
   */
  hasHtmlVersion: boolean;

  /**
   * The total ranking score computed for the item (see the sortCriteria and rankingFunctions query parameters).
   *
   * @example
   * 1626
   */
  score: number;

  /**
   * The item ranking score expressed as a percentage (see the sortCriteria and rankingFunctions query parameters).
   *
   * @example
   * 90.7539
   */
  percentScore: number;

  /**
   * The raw debug information generated by the index to detail how the item was ranked. This property is null unless the debug query parameter is set to true.
   *
   * @example
   * Document weights:\nTitle: 0; Quality: 180; Date: 596; Adjacency: 0; Source: 500; Custom: 350; Collaborative rating: 0; QRE: 0; Ranking functions: 0; \n\nTotal weight: 1626
   */
  rankingInfo: string | null;

  /**
   * Whether the item score was boosted by a featured result rule in the query pipeline.
   */
  isTopResult: boolean;

  /**
   * Whether the item score was boosted as a Coveo ML recommendation.
   */
  isRecommendation: boolean;

  /**
   * The length and offset of each word to highlight in the item title string.
   */
  titleHighlights: HighlightKeyword[];

  /**
   * The length and offset of each word to highlight in the item firstSentences string.
   */
  firstSentencesHighlights: HighlightKeyword[];

  /**
   * The length and offset of each word to highlight in the item excerpt string.
   */
  excerptHighlights: HighlightKeyword[];

  /**
   * The length and offset of each word to highlight in the item printableUri string.
   */
  printableUriHighlights: HighlightKeyword[];

  /**
   * The length and offset of each word to highlight in the item summary string.
   */
  summaryHighlights: HighlightKeyword[];

  /**
   * The basic query expression terms which this query result item does not match.
   * Note: This property is populated by terms from the query pipeline-processed q value (not from the original q value).
   *
   * @example
   * ["platform", "native", "solution"]
   */
  absentTerms: string[];

  /**
   * The values of the fields which were retrieved for this item (see the fieldsToInclude and fieldsToExclude query parameters).
   *
   * @example
   * {
   *   "clickableuri": "https://example.com/",
   *   "author": "Anonymous",
   *   "date": 1502796809427,
   *   "filetype": "forumpost",
   *   "language":["English"],
   *   "conversationid": 898,
   *   "messageid": 2,
   *   "childid": 2,
   *   "adjustednumberoflikes": 46
   * }
   */
  raw: Raw;

  /**
   * If applicable, represents the type of ranking modification that was applied to this result.
   *
   * @example
   * TopResult
   */
  rankingModifier?: string;

  /**
   * Whether the result item has been previously viewed by one of the users specified in the `canSeeUserProfileOf` section of the [search token](https://docs.coveo.com/en/13/api-reference/search-api#tag/Search-V2/operation/token) generated to perform the search request.
   */
  isUserActionView: boolean;
}
