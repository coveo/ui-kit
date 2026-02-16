/**
 * This module is meant to simulate an API that interacts with a cart managed through an external system.
 *
 * For the sake of simplicity, the simulated API is implemented as a singleton class instance whose methods allow
 * interactions with a fake database represented as a private property.
 */

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

type ExternalCartAddItemResponse = ExternalCartItem & {
  additionalData?: Record<string, unknown>;
};

type ExternalCartRemoveItemResponse =
  | (ExternalCartItem & {
      additionalData?: Record<string, unknown>;
    })
  | null;

class ExternalCartService {
  private cartDB: Record<string, ExternalCartItem | undefined> = {};

  private constructor() {}

  public static getInstance(): ExternalCartService {
    if (!globalThis.__externalCartServiceInstance) {
      globalThis.__externalCartServiceInstance = new ExternalCartService();
    }
    return globalThis.__externalCartServiceInstance as ExternalCartService;
  }

  public async addItem(
    item: Omit<ExternalCartItem, 'totalQuantity'>
  ): Promise<ExternalCartAddItemResponse> {
    const existingItem = this.cartDB[item.uniqueId];

    if (existingItem) {
      this.cartDB[item.uniqueId] = {
        ...existingItem,
        totalQuantity: existingItem.totalQuantity + 1,
      };
    } else {
      this.cartDB[item.uniqueId] = {...item, totalQuantity: 1};
    }

    return this.cartDB[item.uniqueId]!;
  }

  public async removeItem(
    item: Omit<ExternalCartItem, 'totalQuantity'>
  ): Promise<ExternalCartRemoveItemResponse> {
    const existingItem = this.cartDB[item.uniqueId];

    if (!existingItem) {
      throw new Error('Item not found');
    }

    if (existingItem.totalQuantity <= 1) {
      delete this.cartDB[item.uniqueId];
    } else {
      this.cartDB[item.uniqueId] = {
        ...existingItem,
        totalQuantity: existingItem.totalQuantity - 1,
      };
    }

    return this.cartDB[item.uniqueId] ?? null;
  }

  public async getItems(): Promise<ExternalCartItem[]> {
    return Object.values(this.cartDB).filter((item) => item !== undefined);
  }

  public async getItem(uniqueId: string): Promise<ExternalCartItem | null> {
    return this.cartDB[uniqueId] ?? null;
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
    this.cartDB = {};

    return {
      transactionId,
      transactionRevenue: await this.getTotalPrice(),
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __externalCartServiceInstance: ExternalCartService | undefined;
}

const externalCartService = ExternalCartService.getInstance();
export default externalCartService;
