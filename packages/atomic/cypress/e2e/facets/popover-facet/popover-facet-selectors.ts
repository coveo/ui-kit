export const popoverComponent = 'atomic-popover';
export const PopoverSelectors = {
  shadow() {
    return cy.get(popoverComponent).shadow();
  },
  label() {
    return this.shadow().find('[part="value-label"]');
  },
  popoverButton() {
    return this.shadow().find('[part="popover-button"]');
  },
  facet() {
    return this.shadow().find('[part="facet"]');
  },
  backdrop() {
    return this.shadow().find('[part="backdrop"]');
  },
};
