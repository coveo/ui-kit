import dayjs, {QUnitType} from 'dayjs';
import {BooleanValue, NumberValue, Schema, StringValue} from '@coveo/bueno';
import {formatDateForSearchApi} from './date-format';
import utc from 'dayjs/plugin/utc';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(utc);
dayjs.extend(quarterOfYear);

const periodsObj = {past: 1, future: 1};
const relativeDatePeriods = Object.keys(periodsObj);
export type RelativeDatePeriod = keyof typeof periodsObj;

const unitsObj = {
  minute: 1,
  hour: 1,
  day: 1,
  week: 1,
  month: 1,
  quarter: 1,
  year: 1,
};
const relativeDateUnits = Object.keys(unitsObj);
export type RelativeDateUnit = keyof typeof unitsObj;

export interface RelativeDate {
  /**
   * The relative period of time.
   */
  period: RelativeDatePeriod;
  /**
   * The unit of time.
   */
  unit: RelativeDateUnit;
  /**
   * The amount of the `unit` of time.
   */
  amount: number;
  /**
   * If `true`, the date will be returned unshifted. If `false`, the date will be adjusted to UTC time.
   *
   * @defaultValue `false`
   */
  useLocalTime?: boolean;
}

export const relativeDateDefinition = {
  amount: new NumberValue({required: true, min: 1}),
  unit: new StringValue({
    required: true,
    constrainTo: relativeDateUnits,
  }),
  period: new StringValue({
    required: true,
    constrainTo: relativeDatePeriods,
  }),
  useLocalTime: new BooleanValue(),
};

export function validateRelativeDate(relativeDate: RelativeDate) {
  new Schema(relativeDateDefinition).validate(relativeDate);
}

function formatRelativeDate(relativeDate: RelativeDate) {
  validateRelativeDate(relativeDate);
  const {period, amount, unit, useLocalTime} = relativeDate;
  const date = useLocalTime ? dayjs() : dayjs().utc();

  switch (period) {
    case 'past':
      return formatDateForSearchApi(date.subtract(amount!, unit as QUnitType));
    case 'future':
      return formatDateForSearchApi(date.add(amount!, unit as QUnitType));
  }
}

function formatCurrentTime(useLocalTime?: boolean) {
  return formatDateForSearchApi(useLocalTime ? dayjs() : dayjs().utc());
}

export function getBoundsFromRelativeDate(relativeDate: RelativeDate) {
  switch (relativeDate.period) {
    case 'past':
      return {
        start: formatRelativeDate(relativeDate),
        end: formatCurrentTime(relativeDate.useLocalTime),
      };
    case 'future':
      return {
        start: formatCurrentTime(relativeDate.useLocalTime),
        end: formatRelativeDate(relativeDate),
      };
  }
}
