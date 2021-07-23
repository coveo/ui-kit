import dayjs, {QUnitType} from 'dayjs';
import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {formatDateForSearchApi} from './date-format';
import utc from 'dayjs/plugin/utc';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(utc);
dayjs.extend(quarterOfYear);

/**
 * The period to set the date relative to.
 */
export type RelativeDatePeriod = 'past' | 'now' | 'next';
const validRelativeDatePeriods = ['past', 'now', 'next'];

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
const validRelativeDateUnits = [
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
export function serializeRelativeDate(relativeDate: RelativeDate) {
  validateRelativeDate(relativeDate);
  const {period, amount, unit} = relativeDate;

  switch (period) {
    case 'past':
    case 'next':
      return `${period}-${amount}-${unit}`;
    case 'now':
      return period;
  }
}

export function formatRelativeDateForSearchApi(date: string) {
  const relativeDate = deserializeRelativeDate(date);
  const {period, amount, unit} = relativeDate;
  switch (period) {
    case 'past':
      return formatDateForSearchApi(
        dayjs().subtract(amount!, unit as QUnitType)
      );
    case 'next':
      return formatDateForSearchApi(dayjs().add(amount!, unit as QUnitType));
    case 'now':
      return formatDateForSearchApi(dayjs());
  }
}

function splitDate(date: string) {
  return date.toLocaleLowerCase().split('-');
}

export function isRelativeDateFormat(date: string) {
  const [period, amount, unit] = splitDate(date);
  if (period === 'now') {
    return true;
  }

  if (!validRelativeDatePeriods.includes(period)) {
    return false;
  }

  if (!validRelativeDateUnits.includes(unit)) {
    return false;
  }

  const intAmount = parseInt(amount);
  if (isNaN(intAmount) || intAmount <= 0) {
    return false;
  }

  return true;
}

export function isRelativeDate(date: unknown): date is RelativeDate {
  return !!date && typeof date === 'object' && 'period' in date!;
}

/**
 * Deserializes relative date string value into a `RelativeDate` object.
 * Throws an error if the format is invalid.
 * @param date The string formatted ... TODO: define format here ([period][amount][unit])
 * @returns The parse `RelativeDate` object.
 */
export function deserializeRelativeDate(date: string): RelativeDate {
  if (!isRelativeDateFormat) {
    throw new Error(
      `The value "${date}" is not respecting the relative date format "period-amount-unit"`
    );
  }

  const [period, amount, unit] = splitDate(date);

  if (period === 'now') {
    return {
      period: 'now',
    };
  }

  return {
    period: period as RelativeDatePeriod,
    amount: amount ? parseInt(amount) : undefined,
    unit: unit ? (unit as RelativeDateUnit) : undefined,
  };
}
