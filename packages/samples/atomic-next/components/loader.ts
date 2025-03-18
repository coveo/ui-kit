import dynamic from 'next/dynamic';
import {ComponentType} from 'react';

type AtomicComponents = typeof import('@coveo/atomic-react');

const load = <K extends keyof AtomicComponents>(
  componentName: K
): ComponentType<AtomicComponents[K] extends ComponentType<infer P> ? P : {}> =>
  dynamic(
    () =>
      import('@coveo/atomic-react').then(
        (mod) =>
          mod[componentName] as ComponentType<
            AtomicComponents[K] extends ComponentType<infer P> ? P : {}
          >
      ),
    {
      ssr: false,
    }
  );

export const AtomicSearchInterface = load('AtomicSearchInterface');
export const AtomicBreadbox = load('AtomicBreadbox');
export const AtomicColorFacet = load('AtomicColorFacet');
export const AtomicDidYouMean = load('AtomicDidYouMean');
export const AtomicFacet = load('AtomicFacet');
export const AtomicFacetManager = load('AtomicFacetManager');
export const AtomicLayoutSection = load('AtomicLayoutSection');
export const AtomicLoadMoreResults = load('AtomicLoadMoreResults');
export const AtomicNoResults = load('AtomicNoResults');
export const AtomicNumericFacet = load('AtomicNumericFacet');
export const AtomicNumericRange = load('AtomicNumericRange');
export const AtomicQueryError = load('AtomicQueryError');
export const AtomicQuerySummary = load('AtomicQuerySummary');
export const AtomicRatingFacet = load('AtomicRatingFacet');
export const AtomicRatingRangeFacet = load('AtomicRatingRangeFacet');
export const AtomicRefineToggle = load('AtomicRefineToggle');
export const AtomicSearchBox = load('AtomicSearchBox');
export const AtomicSearchLayout = load('AtomicSearchLayout');
export const AtomicSortDropdown = load('AtomicSortDropdown');
export const AtomicSortExpression = load('AtomicSortExpression');
export const AtomicTimeframe = load('AtomicTimeframe');
export const AtomicTimeframeFacet = load('AtomicTimeframeFacet');
export const AtomicFormatCurrency = load('AtomicFormatCurrency');
export const AtomicResultBadge = load('AtomicResultBadge');
export const AtomicResultFieldsList = load('AtomicResultFieldsList');
export const AtomicResultImage = load('AtomicResultImage');
export const AtomicResultDate = load('AtomicResultDate');
export const AtomicResultLink = load('AtomicResultLink');
export const AtomicResultList = load('AtomicResultList');
export const AtomicResultMultiValueText = load('AtomicResultMultiValueText');
export const AtomicResultNumber = load('AtomicResultNumber');
export const AtomicResultPrintableUri = load('AtomicResultPrintableUri');
export const AtomicResultRating = load('AtomicResultRating');
export const AtomicResultSectionBadges = load('AtomicResultSectionBadges');
export const AtomicResultSectionBottomMetadata = load(
  'AtomicResultSectionBottomMetadata'
);
export const AtomicResultSectionEmphasized = load(
  'AtomicResultSectionEmphasized'
);
export const AtomicResultSectionExcerpt = load('AtomicResultSectionExcerpt');
export const AtomicResultSectionTitle = load('AtomicResultSectionTitle');
export const AtomicResultSectionTitleMetadata = load(
  'AtomicResultSectionTitleMetadata'
);
export const AtomicResultSectionVisual = load('AtomicResultSectionVisual');
export const AtomicResultText = load('AtomicResultText');
export const AtomicText = load('AtomicText');
