export const popoverComponent = 'atomic-popover';
export const PopoverSelectors = {
  shadow: () => cy.get(popoverComponent).shadow(),
  wrapper: () => PopoverSelectors.shadow().find('[part="popover-wrapper"]'),
  button: () => PopoverSelectors.shadow().find('[part="popover-button"]'),
  slotWrapper: () => PopoverSelectors.shadow().find('[part="slot-wrapper"]'),
  label: () => PopoverSelectors.shadow().find('[part="label"]'),
  placeholder: () => PopoverSelectors.shadow().find('[part="placeholder"]'),
  valueCount: () => PopoverSelectors.shadow().find('[part="value-count"]'),
};
