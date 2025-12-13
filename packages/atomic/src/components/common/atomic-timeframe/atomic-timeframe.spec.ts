import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicTimeframe} from './atomic-timeframe';
import './atomic-timeframe';

describe('atomic-timeframe', () => {
  const renderTimeframe = async ({
    period = 'past',
    unit = 'day',
    amount = 1,
    label,
  }: {
    period?: 'past' | 'next';
    unit?: string;
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

  describe('default properties', () => {
    it('should have default period of "past"', async () => {
      const {timeframe} = await renderTimeframe();
      expect(timeframe.period).toBe('past');
    });

    it('should have default amount of 1', async () => {
      const {timeframe} = await renderTimeframe();
      expect(timeframe.amount).toBe(1);
    });
  });

  describe('when setting period', () => {
    it('should set period to "past"', async () => {
      const {timeframe} = await renderTimeframe({period: 'past'});
      expect(timeframe.period).toBe('past');
    });

    it('should set period to "next"', async () => {
      const {timeframe} = await renderTimeframe({period: 'next'});
      expect(timeframe.period).toBe('next');
    });
  });

  describe('when setting unit', () => {
    it('should set unit to "day"', async () => {
      const {timeframe} = await renderTimeframe({unit: 'day'});
      expect(timeframe.unit).toBe('day');
    });

    it('should set unit to "month"', async () => {
      const {timeframe} = await renderTimeframe({unit: 'month'});
      expect(timeframe.unit).toBe('month');
    });

    it('should set unit to "year"', async () => {
      const {timeframe} = await renderTimeframe({unit: 'year'});
      expect(timeframe.unit).toBe('year');
    });
  });

  describe('when setting amount', () => {
    it('should set amount to 1', async () => {
      const {timeframe} = await renderTimeframe({amount: 1});
      expect(timeframe.amount).toBe(1);
    });

    it('should set amount to 10', async () => {
      const {timeframe} = await renderTimeframe({amount: 10});
      expect(timeframe.amount).toBe(10);
    });

    it('should set amount to 365', async () => {
      const {timeframe} = await renderTimeframe({amount: 365});
      expect(timeframe.amount).toBe(365);
    });
  });

  describe('when setting label', () => {
    it('should set custom label', async () => {
      const label = 'Last month';
      const {timeframe} = await renderTimeframe({label});
      expect(timeframe.label).toBe(label);
    });

    it('should set label to "Past year"', async () => {
      const label = 'Past year';
      const {timeframe} = await renderTimeframe({label});
      expect(timeframe.label).toBe(label);
    });
  });

  describe('Timeframe interface implementation', () => {
    it('should implement all Timeframe interface properties', async () => {
      const {timeframe} = await renderTimeframe({
        period: 'past',
        unit: 'month',
        amount: 3,
        label: 'Last quarter',
      });

      expect(timeframe).toHaveProperty('period');
      expect(timeframe).toHaveProperty('unit');
      expect(timeframe).toHaveProperty('amount');
      expect(timeframe).toHaveProperty('label');
    });
  });

  describe('property reflection', () => {
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
  });
});
