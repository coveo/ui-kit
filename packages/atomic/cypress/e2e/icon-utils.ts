export function getSvg(fileName: string) {
  const file = cy.readFile(`./dist/atomic/assets/${fileName}.svg`);
  return file;
}
