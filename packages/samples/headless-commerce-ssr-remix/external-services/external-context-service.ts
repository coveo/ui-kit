/**
 * This module is meant to simulate an API that interacts with localization context managed through an external system.
 *
 * For the sake of simplicity, the simulated API is implemented as a singleton class instance whose methods allow
 * interactions with a fake database represented as a private property..
 */

type ExternalContextInformation = {
  country: string;
  currency: string;
  language: string;
};

const contextOptions = [
  {
    country: 'US',
    currency: 'USD',
    language: 'en',
  },
  {
    country: 'CA',
    currency: 'CAD',
    language: 'en',
  },
  {
    country: 'CA',
    currency: 'CAD',
    language: 'fr',
  },
  {
    country: 'GB',
    currency: 'GBP',
    language: 'en',
  },
];

class ExternalContextService {
  private contextDB: {country: string; currency: string; language: string} = {
    country: 'US',
    currency: 'USD',
    language: 'en',
  };

  private constructor() {}

  public static getInstance(): ExternalContextService {
    if (!globalThis.__externalContextServiceInstance) {
      globalThis.__externalContextServiceInstance =
        new ExternalContextService();
    }
    return globalThis.__externalContextServiceInstance as ExternalContextService;
  }

  public async getContextInformation(): Promise<ExternalContextInformation> {
    return this.contextDB;
  }

  public async setContextInformation(
    localeInformation: ExternalContextInformation
  ): Promise<void> {
    this.contextDB = localeInformation;
  }

  public getContextOptions(): string[] {
    return contextOptions.map(
      (option) => `${option.language}-${option.country}-${option.currency}`
    );
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __externalContextServiceInstance: ExternalContextService | undefined;
}

const externalContextService = ExternalContextService.getInstance();
export default externalContextService;
