export function buildLogger(totalSteps: number, getCurrentStep: () => number) {
  return (message: string) =>
    console.log(`[${getCurrentStep()}/${totalSteps}] ${message}`);
}
