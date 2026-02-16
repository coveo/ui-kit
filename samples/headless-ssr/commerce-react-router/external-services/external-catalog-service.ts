/**
 * This module is meant to simulate an API that interacts with a catalog managed through an external system.
 *
 * For the sake of simplicity, the simulated API is implemented as a singleton class instance whose methods allow
 * interactions with a fake database represented as a private property.
 */

export type ExternalCatalogItem = {
  uniqueId: string;
  productName: string;
  pricePerUnit: number;
  additionalData?: Record<string, unknown>;
};

class ExternalCatalogService {
  private catalogDB: Record<string, ExternalCatalogItem | undefined> = {};

  private constructor() {}

  public static getInstance(): ExternalCatalogService {
    if (!globalThis.__externalCatalogServiceInstance) {
      globalThis.__externalCatalogServiceInstance =
        new ExternalCatalogService();
    }
    return globalThis.__externalCatalogServiceInstance as ExternalCatalogService;
  }

  public async getItem(url: string): Promise<ExternalCatalogItem> {
    return await this.extractItemFromCatalog(url);
  }

  private async extractItemFromCatalog(
    url: string
  ): Promise<ExternalCatalogItem> {
    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;
    const uniqueId = parsedUrl.pathname.split('/products/')[1];
    if (!this.catalogDB[uniqueId]) {
      this.catalogDB[uniqueId] = {
        uniqueId,
        productName: params.get('name') ?? '',
        pricePerUnit: Number.parseFloat(params.get('price') ?? '0'),
        additionalData: {},
      };
    }
    return this.catalogDB[uniqueId]!;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __externalCatalogServiceInstance: ExternalCatalogService | undefined;
}

const externalCatalogService = ExternalCatalogService.getInstance();
export default externalCatalogService;
