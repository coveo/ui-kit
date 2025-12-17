import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import dayjs, {type QUnitType} from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear.js';
import {
  assertDateAboveAPIMinimum,
  formatDateForSearchApi,
} from './date-format.js';

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

/**
 * Validates a relative date and throws if it's invalid.
 * @param date The relative date, in `RelativeDate` or string format
 */
export function validateRelativeDate(date: RelativeDate | string) {
  if (typeof date === 'string' && !isRelativeDateFormat(date)) {
    throw new Error(
      `The value "${date}" is not respecting the relative date format "period-amount-unit"`
    );
  }

  const relativeDate =
    typeof date === 'string' ? parseRelativeDate(date) : date;

  new Schema(buildRelativeDateDefinition(relativeDate.period)).validate(
    relativeDate
  );

  const dayJsDate = relativeToAbsoluteDate(relativeDate);
  const stringifiedDate = JSON.stringify(relativeDate);
  if (!dayJsDate.isValid()) {
    throw new Error(`Date is invalid: ${stringifiedDate}`);
  }

  assertDateAboveAPIMinimum(dayJsDate);
}

export function serializeRelativeDate(relativeDate: RelativeDate) {
  const {period, amount, unit} = relativeDate;

  switch (period) {
    case 'past':
    case 'next':
      return `${period}-${amount}-${unit}`;
    case 'now':
      return period;
  }
}

function relativeToAbsoluteDate(relativeDate: RelativeDate) {
  const {period, amount, unit} = relativeDate;
  switch (period) {
    case 'past':
      return dayjs().subtract(amount!, unit as QUnitType);
    case 'next':
      return dayjs().add(amount!, unit as QUnitType);
    case 'now':
      return dayjs();
  }
}

export function formatRelativeDateForSearchApi(relativeDate: string) {
  return formatDateForSearchApi(
    relativeToAbsoluteDate(parseRelativeDate(relativeDate))
  );
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
  if (Number.isNaN(intAmount) || intAmount <= 0) {
    return false;
  }

  return true;
}

export function isRelativeDate(date: unknown): date is RelativeDate {
  return !!date && typeof date === 'object' && 'period' in date!;
}

function parseRelativeDate(date: string): RelativeDate {
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

/**
 * Deserializes a relative date string value into a valid `RelativeDate` object.
 * Throws an error if the date is invalid.
 * @param date The string serialized with the format "period-amount-unit"
 * @returns The parsed `RelativeDate` object.
 */
export function deserializeRelativeDate(date: string) {
  validateRelativeDate(date);
  return parseRelativeDate(date);
}
