# Relative date format

When filtering content by date in a facet, it's often preferable to do so with a relative date such as “last week”, rather than with an absolute date such as “February 1st 2021”.
To accommodate relative dates, Headless accepts an alternative string format for date facets.

This format contains 3 parts: `<PERIOD>-<AMOUNT>-<UNIT>`.

## Period

The relative period of time.

- `past`
- `now`
- `next`

## Unit

The unit of time.
When `period` is set to `now`, the `unit` doesn't have to be defined.

- `minute`
- `hour`
- `day`
- `week`
- `month`
- `quarter`
- `year`

## Amount

The amount of the `unit` of time.
When `period` is set to `now`, the `amount` doesn't have to be defined.

Examples:

- `now`
- `past-2-week`
- `next-1-year`

The following example code shows how to use the `buildDateRange` utility to build date ranges.

```js
buildDateRange({
  start: {period: 'past', unit: 'week', amount: 2},
  end: {period: 'now'},
});
// returns {start: 'past-2-week', end: 'now', endInclusive: false, state: 'idle'}
```
