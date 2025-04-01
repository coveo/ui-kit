import {PopoverSelectors} from './popover-facet-selectors';

export function assertLabelContains(label: string) {
  it(`should have the label "${label}"`, () => {
    PopoverSelectors.label().contains(label);
  });
}

export function assertFacetIsVisible() {
  it('should show the facet', () => {
    PopoverSelectors.facet().should('be.visible');
  });
}

export function assertFacetIsHidden() {
  it('should hide the facet', () => {
    PopoverSelectors.facet().should('not.be.visible');
  });
}
