export const VERSION = process.env.VERSION || '0.0.0';

export const COVEO_FRAMEWORK = ['@coveo/atomic', '@coveo/quantic'] as const;

export type CoveoFramework = (typeof COVEO_FRAMEWORK)[number];
