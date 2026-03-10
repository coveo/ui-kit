type StepIcon = 'branch' | 'last';

export class Logger {
  private readonly width = 58;

  constructor(private readonly verbose: boolean) {}

  public line(message: string): void {
    if (!this.verbose) {
      return;
    }
    console.log(message);
  }

  public step(
    icon: StepIcon,
    label: string,
    detail: string,
    durationMs?: number
  ): void {
    if (!this.verbose) {
      return;
    }

    const glyph = icon === 'last' ? '└─' : '├─';
    const body = `${label}: ${detail}`;
    const duration =
      typeof durationMs === 'number'
        ? ` ${this.formatDuration(durationMs)}`
        : '';
    const dots = '.'.repeat(Math.max(2, this.width - body.length));
    console.log(`  ${glyph} ${body} ${dots}${duration}`);
  }

  public substep(label: string): void {
    if (!this.verbose) {
      return;
    }
    console.log(`  │   └─ ${label}`);
  }

  public timer(): () => number {
    const startedAt = performance.now();
    return () => performance.now() - startedAt;
  }

  public isVerbose(): boolean {
    return this.verbose;
  }

  private formatDuration(durationMs: number): string {
    return `${(durationMs / 1000).toFixed(1)}s`;
  }
}
