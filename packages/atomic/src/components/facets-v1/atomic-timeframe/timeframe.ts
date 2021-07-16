import {RelativeDate} from '@coveo/headless';

export interface Timeframe extends RelativeDate {
  label?: string;
}

export const defaultTimeframes: () => Timeframe[] = () => [
  {unit: 'hour', amount: 1, period: 'past'},
  {unit: 'day', amount: 1, period: 'past'},
  {unit: 'week', amount: 1, period: 'past'},
  {unit: 'month', amount: 1, period: 'past'},
  {unit: 'quarter', amount: 1, period: 'past'},
  {unit: 'year', amount: 1, period: 'past'},
];
