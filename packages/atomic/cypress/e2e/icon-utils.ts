export function getSvg(fileName: string) {
  const file = cy.readFile(`./www/build/assets/${fileName}.svg`);
  return file;
}
