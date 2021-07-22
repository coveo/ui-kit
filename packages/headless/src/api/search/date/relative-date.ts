import dayjs, {QUnitType} from 'dayjs';
import {BooleanValue, NumberValue, Schema, StringValue} from '@coveo/bueno';
import {formatDateForSearchApi} from './date-format';
import utc from 'dayjs/plugin/utc';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(utc);
dayjs.extend(quarterOfYear);

/**
 * The period to set the date relative to.
 */
export type RelativeDatePeriod = 'past' | 'now' | 'future';
const validRelativeDatePeriods: RelativeDatePeriod[] = [
  'past',
  'now',
  'future',
];

/**
 * The unit of time in which the date is set relative to.
 */
export type RelativeDateUnit =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';
const validRelativeDateUnits: RelativeDateUnit[] = [
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'quarter',
  'year',
];

/**
 * Defines a date relative to the current moment.
 */
export interface RelativeDate {
  /**
   * The relative period of time.
   */
  period: RelativeDatePeriod;
  /**
   * The unit of time in which the date is set relative to. When `period` is set as `now`, the `unit` does not have to be defined.
   */
  unit?: RelativeDateUnit;
  /**
   * The amount of the `unit` of time. When `period` is set as `now`, the `amount` does not have to be defined.
   */
  amount?: number;
  /**
   * If `true`, the date and time will be returned based on local settings . If `false`, the date will be adjusted to _Coordinated Universal Time_ (UTC).
   *
   * @defaultValue `false`
   */
  useLocalTime?: boolean;
}

const buildRelativeDateDefinition = (period: RelativeDatePeriod) => {
  const isNow = period === 'now';
  return {
    amount: new NumberValue({required: !isNow, min: 1}),
    unit: new StringValue({
      required: !isNow,
      constrainTo: validRelativeDateUnits,
    }),
    period: new StringValue({
      required: true,
      constrainTo: validRelativeDatePeriods,
    }),
    useLocalTime: new BooleanValue(),
  };
};

function validateRelativeDate(relativeDate: RelativeDate) {
  new Schema(buildRelativeDateDefinition(relativeDate.period)).validate(
    relativeDate
  );
}

/**
 * Formats a `RelativeDate` object to a parsable string value.
 * @param relativeDate The `RelativeDate` object.
 */
export function formatRelativeDate(relativeDate: RelativeDate) {
  validateRelativeDate(relativeDate);
  const {period, amount, unit, useLocalTime} = relativeDate;
  const utc = useLocalTime ? '' : 'utc';

  switch (period) {
    case 'past':
    case 'future':
      return `${period}${amount}${unit}${utc}`;
    case 'now':
      return `${period}${utc}`;
  }
}

export function formatRelativeDateForSearchApi(date: string) {
  const relativeDate = parseRelativeDate(date);
  const {period, amount, unit, useLocalTime} = relativeDate;
  const dayjsDate = useLocalTime ? dayjs() : dayjs().utc();

  switch (period) {
    case 'past':
      return formatDateForSearchApi(
        dayjsDate.subtract(amount!, unit as QUnitType)
      );
    case 'future':
      return formatDateForSearchApi(dayjsDate.add(amount!, unit as QUnitType));
    case 'now':
      return formatDateForSearchApi(dayjsDate);
  }
}

const relativeDateFormatRegexp = new RegExp(
  `^((?<period>past|future)(?<amount>\\d+)(?<unit>${validRelativeDateUnits.join(
    '|'
  )})|(?<now>now))(?<utc>utc)?$`,
  'i'
);

export function isRelativeDateFormat(date: string) {
  if (date.toLowerCase() === 'now') {
    return true;
  }

  return relativeDateFormatRegexp.test(date);
}

export function isRelativeDate(date: unknown): date is RelativeDate {
  return date && typeof date === 'object' && 'period' in date ? true : false;
}

/**
 * Parses a formatted relative date string value.
 * Throws an error if the format is invalid.
 * @param date The string formatted ... TODO: define format here ([period][amount][unit])
 * @returns The parse `RelativeDate` object.
 */
export function parseRelativeDate(date: string): RelativeDate {
  if (!isRelativeDateFormat) {
    throw new Error(
      `The value "${date}" is not respecting the relative date format "[period][amount][unit]"`
    );
  }

  const groups = date.toLowerCase().match(relativeDateFormatRegexp)!['groups']!;
  return {
    period: (groups['now'] || groups['period']) as RelativeDatePeriod,
    amount: groups['amount'] ? parseInt(groups['amount']) : undefined,
    unit: groups['unit'] ? (groups['unit'] as RelativeDateUnit) : undefined,
    useLocalTime: !groups['utc'],
  };
}
