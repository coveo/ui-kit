let idCounter = 0;

export function generateUniqueIdForInput(prefix = 'input') {
  idCounter++;
  return `${prefix}-${idCounter}`;
}
