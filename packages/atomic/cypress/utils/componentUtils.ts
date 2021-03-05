export async function getTextOfAllElements(selector: string) {
  return new Promise((resolve) => {
    cy.get(selector).then((elems) => {
      const originalValues = [...elems].map((el: any) => el.textContent.trim());
      resolve(originalValues);
    });
  });
}

export function doSortAlphanumeric(originalValues: string[]) {
  return originalValues
    .concat()
    .sort((first, second) => first.localeCompare(second));
}
