export function randomID(prepend?: string, length = 5) {
  const randomStr = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  if (!prepend) {
    return randomStr;
  }
  return prepend + randomStr;
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
