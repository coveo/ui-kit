export const randomID = (prepend?: string, length = 5) =>
  prepend +
  Math.random()
    .toString(36)
    .substr(2, 2 + length);
