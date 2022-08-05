import {should} from '../../common-assertions';
import {PopoverSelectors} from './popover-selector';

export function assertDisplayPopover(display: boolean) {
  it(`${should(display)} display the popover`, () => {
    PopoverSelectors.wrapper().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplaySlotWrapper(display: boolean) {
  it(`${should(display)} display the popover's slot wrapper`, () => {
    PopoverSelectors.slotWrapper().should(
      display ? 'be.visible' : 'not.be.visible'
    );
  });
}

export function assertNumberOfSelectedValues(numberOfSelectedValues: string) {
  it(`should have ${numberOfSelectedValues} selected values`, () => {
    console.log(PopoverSelectors.valueCount());
    PopoverSelectors.valueCount()
      .invoke('attr', 'title')
      .should('eq', numberOfSelectedValues);
  });
}
