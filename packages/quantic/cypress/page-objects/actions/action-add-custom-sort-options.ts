export const addCustomSortOptions = () =>
  cy
    .get(
      'c-action-add-custom-sort-options[data-id="add-custom-sort-options"] button'
    )
    .click();
export const addInvalidCustomSortOptions = () =>
  cy
    .get(
      'c-action-add-custom-sort-options[data-id="add-invalid-custom-sort-options"] button'
    )
    .click();
