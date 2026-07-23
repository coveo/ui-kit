export function isTrackingDisabled(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const value = env.DO_NOT_TRACK;
  if (value === undefined) {
    return false;
  }
  const normalized = value.trim();
  return normalized.length > 0 && normalized !== '0';
}

export function buildCrashDisclosure(reportPath: string): string {
  return [
    `A crash report was saved to: ${reportPath}`,
    '',
    'To submit it (nothing is sent otherwise):',
    `  npx @coveo/create-ui report ${reportPath}`,
    '',
    'Set DO_NOT_TRACK=1 to disable.',
  ].join('\n');
}
