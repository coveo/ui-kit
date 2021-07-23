import {
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
} from './facet-common-assertions';

export function selectIdleCheckboxValueAt(
  FacetWithCheckboxSelector: FacetWithCheckboxSelector,
  index: number
) {
  FacetWithCheckboxSelector.idleCheckboxValue().eq(index).click();
}

export function selectIdleLinkValueAt(
  FacetWithLinkSelector: FacetWithLinkSelector,
  index: number
) {
  FacetWithLinkSelector.idleLinkValue().eq(index).click();
}
