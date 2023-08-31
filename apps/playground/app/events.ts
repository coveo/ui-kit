export interface SampleEvent {
  type: string;
  payload: Record<string, unknown>;
}

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

export function getEvents(): SampleEvent[] {
  return [ecPurchase];
}
