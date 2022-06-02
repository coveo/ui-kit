export type TestedRegion = 'us' | 'au' | 'eu';
export type TestedEnvironment = 'dev' | 'stg' | 'prod' | 'hipaa';

export interface TestedPlatformURL {
  region?: TestedRegion;
  environment?: TestedEnvironment;
  platform: string;
  search: string;
  analytics: string;
}

export const allValidPlatformCombination: () => TestedPlatformURL[] = () => [
  {
    region: undefined,
    environment: undefined,
    platform: 'https://platform.cloud.coveo.com',
    search: 'https://platform.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics.cloud.coveo.com/rest/ua',
  },
  {
    region: undefined,
    environment: 'prod',
    platform: 'https://platform.cloud.coveo.com',
    search: 'https://platform.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics.cloud.coveo.com/rest/ua',
  },
  {
    region: 'us',
    environment: undefined,
    platform: 'https://platform.cloud.coveo.com',
    search: 'https://platform.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics.cloud.coveo.com/rest/ua',
  },
  {
    region: 'us',
    environment: 'prod',
    platform: 'https://platform.cloud.coveo.com',
    search: 'https://platform.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics.cloud.coveo.com/rest/ua',
  },
  {
    region: 'au',
    environment: 'prod',
    platform: 'https://platform-au.cloud.coveo.com',
    search: 'https://platform-au.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics-au.cloud.coveo.com/rest/ua',
  },
  {
    region: 'au',
    environment: undefined,
    platform: 'https://platform-au.cloud.coveo.com',
    search: 'https://platform-au.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics-au.cloud.coveo.com/rest/ua',
  },
  {
    region: 'eu',
    environment: 'prod',
    platform: 'https://platform-eu.cloud.coveo.com',
    search: 'https://platform-eu.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics-eu.cloud.coveo.com/rest/ua',
  },
  {
    region: 'eu',
    environment: undefined,
    platform: 'https://platform-eu.cloud.coveo.com',
    search: 'https://platform-eu.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analytics-eu.cloud.coveo.com/rest/ua',
  },
  {
    region: 'us',
    environment: 'stg',
    platform: 'https://platformstg.cloud.coveo.com',
    search: 'https://platformstg.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analyticsstg.cloud.coveo.com/rest/ua',
  },
  {
    region: undefined,
    environment: 'stg',
    platform: 'https://platformstg.cloud.coveo.com',
    search: 'https://platformstg.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analyticsstg.cloud.coveo.com/rest/ua',
  },
  {
    region: 'us',
    environment: 'dev',
    platform: 'https://platformdev.cloud.coveo.com',
    search: 'https://platformdev.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analyticsdev.cloud.coveo.com/rest/ua',
  },
  {
    region: undefined,
    environment: 'dev',
    platform: 'https://platformdev.cloud.coveo.com',
    search: 'https://platformdev.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analyticsdev.cloud.coveo.com/rest/ua',
  },
  {
    region: 'eu',
    environment: 'dev',
    platform: 'https://platformdev-eu.cloud.coveo.com',
    search: 'https://platformdev-eu.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analyticsdev-eu.cloud.coveo.com/rest/ua',
  },
  {
    region: undefined,
    environment: 'hipaa',
    platform: 'https://platformhipaa.cloud.coveo.com',
    search: 'https://platformhipaa.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analyticshipaa.cloud.coveo.com/rest/ua',
  },
  {
    region: 'us',
    environment: 'hipaa',
    platform: 'https://platformhipaa.cloud.coveo.com',
    search: 'https://platformhipaa.cloud.coveo.com/rest/search/v2',
    analytics: 'https://analyticshipaa.cloud.coveo.com/rest/ua',
  },
  {
    region: undefined,
    environment: undefined,
    multiRegionSubDomain: 'myorg',
    platform: 'https://myorg.org.coveo.com',
    search: 'https://myorg.org.coveo.com/rest/search/v2',
    analytics: 'https://analytics.cloud.coveo.com/rest/ua',
  },
];
