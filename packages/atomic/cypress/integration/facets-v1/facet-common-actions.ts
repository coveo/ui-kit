import {FacetsSelector} from './facet-common-assertions';

export function selectIdleCheckboxValueAt(
  FacetsSelector: FacetsSelector,
  index: number
) {
  FacetsSelector.idleCheckboxValue().eq(index).click();
}

export function selectIdleLinkValueAt(
  FacetsSelector: FacetsSelector,
  index: number
) {
  FacetsSelector.idleLinkValue().eq(index).click();
}
