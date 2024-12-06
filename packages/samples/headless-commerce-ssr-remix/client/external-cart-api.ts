export type ExternalCartItem = {
  uniqueId: string;
  productName: string;
  pricePerUnit: number;
  totalQuantity: number;
  additionalData?: Record<string, unknown>;
};

export type ExternalCartPurchaseResponse = {
  transactionId: string;
  transactionRevenue: number;
  additionalData?: Record<string, unknown>;
};

export type ExternalCartAddItemResponse = ExternalCartItem & {
  additionalData?: Record<string, unknown>;
};

export type ExternalCartRemoveItemResponse =
  | (ExternalCartItem & {
      additionalData?: Record<string, unknown>;
    })
  | null;

class ExternalCartAPI {
  private cart: Record<string, ExternalCartItem | undefined> = {};

  private constructor() {}

  public static getInstance(): ExternalCartAPI {
    if (!globalThis.__externalCartInstance) {
      globalThis.__externalCartInstance = new ExternalCartAPI();
    }
    return globalThis.__externalCartInstance as ExternalCartAPI;
  }

  public async addItem(
    item: Omit<ExternalCartItem, 'totalQuantity'>
  ): Promise<ExternalCartAddItemResponse> {
    const existingItem = this.cart[item.uniqueId];

    if (existingItem) {
      this.cart[item.uniqueId] = {
        ...existingItem,
        totalQuantity: existingItem.totalQuantity + 1,
      };
    } else {
      this.cart[item.uniqueId] = {...item, totalQuantity: 1};
    }

    return this.cart[item.uniqueId]!;
  }

  public async removeItem(
    item: Omit<ExternalCartItem, 'totalQuantity'>
  ): Promise<ExternalCartRemoveItemResponse> {
    const existingItem = this.cart[item.uniqueId];

    if (!existingItem) {
      throw new Error('Item not found');
    }

    if (existingItem.totalQuantity <= 1) {
      delete this.cart[item.uniqueId];
    } else {
      this.cart[item.uniqueId] = {
        ...existingItem,
        totalQuantity: existingItem.totalQuantity - 1,
      };
    }

    return this.cart[item.uniqueId] ?? null;
  }

  public async getItems(): Promise<ExternalCartItem[]> {
    return Object.values(this.cart).filter((item) => item !== undefined);
  }

  public async getItem(uniqueId: string): Promise<ExternalCartItem | null> {
    return this.cart[uniqueId] ?? null;
  }

  public async getTotalPrice(): Promise<number> {
    return (await this.getItems()).reduce((acc, item) => {
      return acc + item.pricePerUnit * item.totalQuantity;
    }, 0);
  }

  public async getTotalCount(): Promise<number> {
    return (await this.getItems()).reduce((acc, item) => {
      return acc + item.totalQuantity;
    }, 0);
  }

  public async purchase(): Promise<ExternalCartPurchaseResponse> {
    const transactionId = Math.random().toString(36).substring(7);
    this.cart = {};

    return {
      transactionId,
      transactionRevenue: await this.getTotalPrice(),
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __externalCartInstance: ExternalCartAPI | undefined;
}

const externalCartAPI = ExternalCartAPI.getInstance();
export default externalCartAPI;
