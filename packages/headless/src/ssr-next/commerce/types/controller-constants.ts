export enum SolutionType {
  search = 'search',
  listing = 'listing',
  standalone = 'standalone',
  recommendation = 'recommendation',
}

const recommendationOptionKey = 'recommendation-internal-options';

export const recommendationInternalOptionKey = Symbol.for(
  recommendationOptionKey
);
