import dayjs, {QUnitType} from 'dayjs';
import {BooleanValue, NumberValue, Schema, StringValue} from '@coveo/bueno';
import {formatDateForSearchApi} from './date-format';
import utc from 'dayjs/plugin/utc';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(utc);
dayjs.extend(quarterOfYear);

export type RelativeDatePeriod = 'past' | 'now' | 'future';
const validRelativeDatePeriods: RelativeDatePeriod[] = [
  'past',
  'now',
  'future',
];

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

export interface RelativeDate {
  /**
   * The relative period of time.
   */
  period: RelativeDatePeriod;
  /**
   * The unit of time. When `period` is `now`, does not have to be defined.
   */
  unit?: RelativeDateUnit;
  /**
   * The amount of the `unit` of time. When `period` is `now`, does not have to be defined.
   */
  amount?: number;
  /**
   * If `true`, the date will be returned unshifted. If `false`, the date will be adjusted to UTC time.
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

export function formatRelativeDate(relativeDate: RelativeDate) {
  validateRelativeDate(relativeDate);
  const {period, amount, unit, useLocalTime} = relativeDate;
  const date = useLocalTime ? dayjs() : dayjs().utc();

  switch (period) {
    case 'past':
      return formatDateForSearchApi(date.subtract(amount!, unit as QUnitType));
    case 'future':
      return formatDateForSearchApi(date.add(amount!, unit as QUnitType));
    case 'now':
      return formatDateForSearchApi(date);
  }
}

const relativeDateFormatRegexp = new RegExp(
  `^(${validRelativeDatePeriods.join('|')})(\\d+)(${validRelativeDateUnits.join(
    '|'
  )})$`,
  'i'
);

export function isRelativeDate(date: string) {
  if (date.toLowerCase() === 'now') {
    return true;
  }

  return relativeDateFormatRegexp.test(date);
}

export function parseRelativeDate(date: string): RelativeDate {
  if (!isRelativeDate) {
    throw new Error(
      `The value "${date}" is not respecting the relative date format "[period][amount][unit]"`
    );
  }

  if (date.toLowerCase() === 'now') {
    return {
      period: 'now',
    };
  }

  const matches = date.match(relativeDateFormatRegexp)!;
  return {
    period: matches[1] as RelativeDatePeriod,
    amount: parseInt(matches[2]),
    unit: matches[3] as RelativeDateUnit,
  };
}
