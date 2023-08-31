export interface SampleEvent {
  type: string;
  payload: Record<string, unknown>;
}

const itemMetadata = {
  uniqueFieldValue: "permanentId",
  uniqueFieldName: "item-1",
  title: "Item 1",
  author: "John Doe",
  url: "https://arealshop.ca/real-brand/item-1",
};

const ecPurchase: SampleEvent = {
  type: "ecPurchase",
  payload: {
    currency: "USD",
    products: [
      {
        product: {
          productId: "a",
          name: "ski",
          price: 10,
          sku: "ski-large",
        },
        quantity: 1,
      },
    ],
    transaction: {
      id: "1234",
      revenue: 12,
    },
  },
};

const itemClick: SampleEvent = {
  type: "itemClick",
  payload: {
    searchUid: "search-1",
    position: 1,
    itemMetadata,
  },
};

const itemView: SampleEvent = {
  type: "itemView",
  payload: {
    itemMetadata,
  },
};

export function getEvents(): SampleEvent[] {
  return [ecPurchase, itemClick, itemView];
}
