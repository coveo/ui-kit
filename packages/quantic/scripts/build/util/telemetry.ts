export const DEPLOYMENT_TELEMETRY_PREFIX = 'QUANTIC_DEPLOY_TELEMETRY ';

export type DeploymentStep =
  | 'authorization'
  | 'availability_checks'
  | 'community_creation'
  | 'community_metadata_deployment'
  | 'old_org_deletion'
  | 'publication'
  | 'scratch_org_creation'
  | 'source_deployment';

export class DeploymentTelemetry {
  constructor(
    private readonly writeLine: (line: string) => void = console.log,
    private readonly now: () => number = Date.now
  ) {}

  public async measure<T>(
    step: DeploymentStep,
    action: () => Promise<T>
  ): Promise<T> {
    const startedAt = this.now();
    try {
      const result = await action();
      this.writeDuration(step, 'success', startedAt);
      return result;
    } catch (error) {
      this.writeDuration(step, 'failure', startedAt);
      throw error;
    }
  }

  private writeDuration(
    step: DeploymentStep,
    status: 'failure' | 'success',
    startedAt: number
  ) {
    this.writeLine(
      `${DEPLOYMENT_TELEMETRY_PREFIX}${JSON.stringify({
        durationMs: Math.max(0, this.now() - startedAt),
        event: 'step_duration',
        status,
        step,
        version: 1,
      })}`
    );
  }
}
