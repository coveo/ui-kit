export const VERSION = process.env.VERSION || 'Test version';

export const COVEO_FRAMEWORK = ['@coveo/atomic', '@coveo/quantic'] as const;

export type CoveoFramework = (typeof COVEO_FRAMEWORK)[number];
