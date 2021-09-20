import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {TimeframeFacetSelectors} from './timeframe-facet-selectors';

export interface UnitRange extends TagProps {
  unit: string;
}

export const label = 'Timeframe';
export const field = 'date';
export const unitFrames: UnitRange[] = [
  {unit: 'month'},
  {unit: 'quarter'},
  {unit: 'year'},
];

export const unitFramesCustom = [{unit: 'day', period: 'next', amout: 2}];
export const addTimeframeFacet =
  (props: TagProps = {}, units?: UnitRange[]) =>
  (env: TestFixture) => {
    const e = generateComponentHTML('atomic-timeframe-facet', props);
    if (units) {
      units.forEach((u: UnitRange) => {
        const rangeHTML = generateComponentHTML('atomic-timeframe', u);
        e.append(rangeHTML);
      });
    }
    env.withElement(e);
  };

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
