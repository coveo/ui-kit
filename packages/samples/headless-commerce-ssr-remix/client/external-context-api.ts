export type ExternalContextInformation = {
  country: string;
  currency: string;
  language: string;
};

class ExternalContextAPI {
  private country: string = 'US';
  private currency: string = 'USD';
  private language: string = 'en';

  private constructor() {}

  public static getInstance(): ExternalContextAPI {
    if (!globalThis.__externalContextInstance) {
      globalThis.__externalContextInstance = new ExternalContextAPI();
    }
    return globalThis.__externalContextInstance as ExternalContextAPI;
  }

  public async getContextInformation(): Promise<ExternalContextInformation> {
    return {
      country: this.country,
      currency: this.currency,
      language: this.language,
    };
  }

  public async setContextInformation(
    localeInformation: ExternalContextInformation
  ): Promise<void> {
    this.country = localeInformation.country;
    this.currency = localeInformation.currency;
    this.language = localeInformation.language;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __externalContextInstance: ExternalContextAPI | undefined;
}

const externalContextAPI = ExternalContextAPI.getInstance();
export default externalContextAPI;
