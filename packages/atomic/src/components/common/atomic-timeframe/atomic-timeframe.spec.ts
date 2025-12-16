import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicTimeframe} from './atomic-timeframe';
import './atomic-timeframe';
import type {RelativeDateUnit} from '@coveo/headless';

describe('atomic-timeframe', () => {
  const renderTimeframe = async ({
    period = 'past',
    unit = 'day',
    amount = 1,
    label,
  }: {
    period?: 'past' | 'next';
    unit?: RelativeDateUnit;
    amount?: number;
    label?: string;
  } = {}) => {
    const element = await renderFunctionFixture(html`
      <atomic-timeframe
        period=${period}
        unit=${unit}
        amount=${amount}
        label=${label ?? ''}
      ></atomic-timeframe>
    `);

    const timeframe = element.querySelector(
      'atomic-timeframe'
    ) as AtomicTimeframe;

    return {element, timeframe};
  };

  it('should have default period of "past"', async () => {
    const {timeframe} = await renderTimeframe();
    expect(timeframe.period).toBe('past');
  });

  it('should have default amount of 1', async () => {
    const {timeframe} = await renderTimeframe();
    expect(timeframe.amount).toBe(1);
  });

  it('should set period to "past" from "next"', async () => {
    const {timeframe} = await renderTimeframe({period: 'next'});
    timeframe.period = 'past';
    await timeframe.updateComplete;
    expect(timeframe.period).toBe('past');
  });

  it('should set period to "next"', async () => {
    const {timeframe} = await renderTimeframe({period: 'next'});
    expect(timeframe.period).toBe('next');
  });

  it.each<RelativeDateUnit>([
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'quarter',
    'year',
  ])('should set unit to "%s"', async (unit) => {
    const {timeframe} = await renderTimeframe({unit});
    expect(timeframe.unit).toBe(unit);
  });

  it('should set amount to a valid value', async () => {
    const {timeframe} = await renderTimeframe({amount: 10});
    expect(timeframe.amount).toBe(10);
  });

  it('should set custom label', async () => {
    const label = 'Last month';
    const {timeframe} = await renderTimeframe({label});
    expect(timeframe.label).toBe(label);
  });

  it('should reflect period attribute', async () => {
    const {timeframe} = await renderTimeframe({period: 'next'});
    expect(timeframe.getAttribute('period')).toBe('next');
  });

  it('should reflect unit attribute', async () => {
    const {timeframe} = await renderTimeframe({unit: 'week'});
    expect(timeframe.getAttribute('unit')).toBe('week');
  });

  it('should reflect amount attribute', async () => {
    const {timeframe} = await renderTimeframe({amount: 7});
    expect(timeframe.getAttribute('amount')).toBe('7');
  });

  it('should reflect label attribute when set', async () => {
    const {timeframe} = await renderTimeframe({label: 'Custom Label'});
    expect(timeframe.getAttribute('label')).toBe('Custom Label');
  });

  // TODO V4: KIT-5197 - Remove this test
  it.each<{
    prop: 'period' | 'unit' | 'amount';
    validValue: string | number;
    invalidValue: string | number;
  }>([
    {
      prop: 'period',
      validValue: 'past',
      invalidValue: 'invalid',
    },
    {
      prop: 'unit',
      validValue: 'day',
      invalidValue: 'invalid',
    },
    {
      prop: 'amount',
      validValue: 1,
      invalidValue: 0,
    },
  ])(
    'should log validation warning when #$prop is updated to invalid value',
    async ({prop, validValue, invalidValue}) => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const {timeframe} = await renderTimeframe({[prop]: validValue});

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (timeframe as any)[prop] = invalidValue;
      await timeframe.updateComplete;

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Prop validation failed for component atomic-timeframe'
        ),
        timeframe
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(prop),
        timeframe
      );

      consoleWarnSpy.mockRestore();
    }
  );

  // TODO V4: KIT-5197 - Remove skip
  it.skip.each<{
    prop: 'period' | 'unit' | 'amount';
    validValue: string | number;
    invalidValue: string | number;
  }>([
    {
      prop: 'period',
      validValue: 'past',
      invalidValue: 'invalid',
    },
    {
      prop: 'unit',
      validValue: 'day',
      invalidValue: 'invalid',
    },
    {
      prop: 'amount',
      validValue: 1,
      invalidValue: 0,
    },
    {
      prop: 'amount',
      validValue: 1,
      invalidValue: -1,
    },
  ])(
    'should set error when valid #$prop is updated to an invalid value',
    async ({prop, validValue, invalidValue}) => {
      const {timeframe} = await renderTimeframe({[prop]: validValue});

      expect(timeframe.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (timeframe as any)[prop] = invalidValue;
      await timeframe.updateComplete;

      expect(timeframe.error).toBeDefined();
      expect(timeframe.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );
});
