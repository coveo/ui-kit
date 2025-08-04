import {SolutionType} from './controller-constants.js';

export interface NonRecommendationController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * @internal
   */
  [SolutionType.standalone]: true;
}

export interface UniversalController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * @internal
   */
  [SolutionType.standalone]: true;
  /**
   * @internal
   */
  [SolutionType.recommendation]: true;
}

export interface SearchOnlyController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
}

export interface ListingOnlyController {
  /**
   * @internal
   */
  [SolutionType.listing]: true;
}

export interface RecommendationOnlyController {
  /**
   * @internal
   */
  [SolutionType.recommendation]: true;
}

export interface SearchAndListingController {
  /**
   * @internal
   */
  [SolutionType.search]: true;
  /**
   * @internal
   */
  [SolutionType.listing]: true;
}

export interface ListingAndStandaloneController {
  /**
   * @internal
   */
  [SolutionType.listing]: true;
  /**
   * @internal
   */
  [SolutionType.standalone]: true;
}
