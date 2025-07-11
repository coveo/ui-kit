import type {i18n} from 'i18next';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import type {NumberFormatter} from '../../formats/format-common';

export interface FacetValueRange {
  endInclusive: boolean;
  start: number;
  end: number;
  label?: string;
  state: 'selected' | 'idle' | 'excluded';
}

export interface FormatFacetValueRange {
  field: string;
  facetValue: FacetValueRange & {numberOfResults: number};
  manualRanges: FacetValueRange[];
  i18n: i18n;
  logger: Pick<Console, 'error'>;
  formatter: NumberFormatter;
}

export const formatHumanReadable = ({
  manualRanges,
  field,
  i18n,
  facetValue,
  logger,
  formatter,
}: FormatFacetValueRange) => {
  const manualRangeLabel = manualRanges.find((range) =>
    areRangesEqual(range, facetValue)
  )?.label;
  return manualRangeLabel
    ? getFieldValueCaption(field, manualRangeLabel, i18n)
    : i18n.t('to', {
        start: formatNumberLocalized(facetValue.start, i18n, logger, formatter),
        end: formatNumberLocalized(facetValue.end, i18n, logger, formatter),
      });
};

export const formatNumberLocalized = (
  value: number,
  i18n: FormatFacetValueRange['i18n'],
  logger: FormatFacetValueRange['logger'],
  formatter: FormatFacetValueRange['formatter']
) => {
  try {
    return formatter(value, i18n.languages as string[]);
  } catch (error) {
    logger.error(
      `atomic-numeric-facet facet value "${value}" could not be formatted correctly.`,
      error
    );
    return value;
  }
};

const areRangesEqual = (
  firstRange: FacetValueRange,
  secondRange: FacetValueRange
) => {
  return (
    firstRange.start === secondRange.start &&
    firstRange.end === secondRange.end &&
    firstRange.endInclusive === secondRange.endInclusive
  );
};
