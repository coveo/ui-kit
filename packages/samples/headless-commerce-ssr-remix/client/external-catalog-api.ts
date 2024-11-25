export type ExternalCatalogItem = {
  uniqueId: string;
  productName: string;
  pricePerUnit: number;
  additionalData?: Record<string, unknown>;
};

class ExternalCatalogAPI {
  private constructor() {}

  public static getInstance(): ExternalCatalogAPI {
    if (!globalThis.__externalCatalogInstance) {
      globalThis.__externalCatalogInstance = new ExternalCatalogAPI();
    }
    return globalThis.__externalCatalogInstance as ExternalCatalogAPI;
  }

  public async getItem(url: string): Promise<ExternalCatalogItem> {
    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;
    return {
      uniqueId: parsedUrl.pathname.split('/products/')[1],
      productName: params.get('name') ?? '',
      pricePerUnit: Number.parseFloat(params.get('price') ?? '0'),
      additionalData: {},
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __externalCatalogInstance: ExternalCatalogAPI | undefined;
}

const externalCatalogAPI = ExternalCatalogAPI.getInstance();
export default externalCatalogAPI;
