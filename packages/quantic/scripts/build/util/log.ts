export type StepLogger = (message: string) => void;

export class StepsRunner {
  private steps: ((log: StepLogger) => Promise<void>)[];
  private currentStep = 0;
  private stopped = false;

  constructor() {
    this.steps = [];
  }

  public add(action: (log: StepLogger) => Promise<void>): StepsRunner {
    this.steps.push(action);

    return this;
  }

  public getLogger(): StepLogger {
    return (message: string) =>
      this.log(this.currentStep, this.steps.length, message);
  }

  public stop() {
    this.stopped = true;
  }

  public async run() {
    for (const step of this.steps) {
      this.currentStep++;
      await step(this.getLogger());
      if (this.stopped) {
        return;
      }
    }
  }

  private log(currentStep: number, totalSteps: number, message: string) {
    console.log(`[${currentStep}/${totalSteps}] ${message}`);
  }
}
