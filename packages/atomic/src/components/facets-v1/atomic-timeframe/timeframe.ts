import {RelativeDate} from '@coveo/headless';

export interface Timeframe extends RelativeDate {
  label?: string;
}

export const defaultTimeframes: () => Timeframe[] = () => [
  {unit: 'hour', amount: 1, period: 'past', useLocalTime: true},
  {unit: 'day', amount: 1, period: 'past', useLocalTime: true},
  {unit: 'week', amount: 1, period: 'past', useLocalTime: true},
  {unit: 'month', amount: 1, period: 'past', useLocalTime: true},
  {unit: 'quarter', amount: 1, period: 'past', useLocalTime: true},
  {unit: 'year', amount: 1, period: 'past', useLocalTime: true},
];
