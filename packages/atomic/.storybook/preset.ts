export const managerEntries = (entry = []) => {
  return [...entry, require.resolve('./register')];
}
