import {buildDateRange} from '@coveo/headless';

export const relativeDateRanges = [
  buildDateRange({
    start: {period: 'past', unit: 'day', amount: 1},
    end: {period: 'now'},
  }),
  buildDateRange({
    start: {period: 'past', unit: 'week', amount: 1},
    end: {period: 'now'},
  }),
  buildDateRange({
    start: {period: 'past', unit: 'month', amount: 1},
    end: {period: 'now'},
  }),
  buildDateRange({
    start: {period: 'past', unit: 'quarter', amount: 1},
    end: {period: 'now'},
  }),
  buildDateRange({
    start: {period: 'past', unit: 'year', amount: 1},
    end: {period: 'now'},
  }),
];
