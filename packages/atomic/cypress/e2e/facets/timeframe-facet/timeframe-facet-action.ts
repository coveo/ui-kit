import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {TimeframeFacetSelectors} from './timeframe-facet-selectors';

export interface UnitRange extends TagProps {
  period: string;
  amount: number;
  unit: string;
}

export const timeframeFacetLabel = 'Timeframe';
export const timeframeFacetField = 'date';
export const unitFrames: UnitRange[] = [
  {period: 'past', unit: 'month', amount: 1},
  {period: 'past', unit: 'quarter', amount: 1},
  {period: 'past', unit: 'year', amount: 10},
];

export const unitFramesCustom = [{unit: 'day', period: 'next', amount: 2}];
export const addTimeframeFacet =
  (props: TagProps = {}, units?: UnitRange[]) =>
  (env: TestFixture) => {
    const e = generateComponentHTML('atomic-timeframe-facet', props);
    if (units) {
      e.append(...createTimeframeElements(units));
    }
    env.withElement(e);
  };

export function createTimeframeElements(units: UnitRange[] = unitFrames) {
  return units.map((u: UnitRange) => {
    return generateComponentHTML('atomic-timeframe', u);
  });
}

export function inputStartDate(value: number | string) {
  TimeframeFacetSelectors.startDate().type(value.toString(), {force: true});
}

export function inputEndDate(value: number | string) {
  TimeframeFacetSelectors.endDate().type(value.toString(), {force: true});
}

export function clickApplyButton() {
  TimeframeFacetSelectors.applyButton().click({force: true});
}

export function invokeSubmitButton() {
  TimeframeFacetSelectors.rangeInput().invoke('submit', (e: Event) => {
    // do not actually submit the form
    e.preventDefault();
    // fail this test
    throw new Error('Form should not submit!');
  });
}
