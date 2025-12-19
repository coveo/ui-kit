export const baseResponse = {
  completions: [
    {
      expression: 'connection issue',
      score: 100,
      executableConfidence: 1.0,
      highlighted: '[connection] [issue]',
    },
    {
      expression: 'password reset',
      score: 95,
      executableConfidence: 0.95,
      highlighted: '[password] reset',
    },
    {
      expression: 'account setup',
      score: 90,
      executableConfidence: 0.9,
      highlighted: '[account] setup',
    },
    {
      expression: 'billing question',
      score: 85,
      executableConfidence: 0.85,
      highlighted: '[billing] question',
    },
    {
      expression: 'technical support',
      score: 80,
      executableConfidence: 0.8,
      highlighted: '[technical] support',
    },
  ],
};
