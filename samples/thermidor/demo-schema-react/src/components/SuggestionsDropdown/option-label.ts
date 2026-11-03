/**
 * The accessible name of an option of the dropdown, read when the arrow keys reach it: its name,
 * its position in its list and, when the suggestions have products beside them, which list it is in.
 */
export function optionLabel(
  name: string,
  position: number,
  count: number,
  list?: 'Left' | 'Right'
): string {
  const label = `${name}. ${position} of ${count}.`;
  return list ? `${label} In ${list} list.` : label;
}
