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

const product = {
  productId: "a",
  name: "ski",
  price: 10,
};

const products = [
  { product, quantity: 1 },
  {
    product: {
      productId: "b",
      name: "snowboard",
      price: 10,
    },
    quantity: 2,
  },
];

const ecCartAction: SampleEvent = {
  type: "ec.cartAction",
  payload: {
    action: "add",
    currency: "EUR",
    product,
    quantity: 1,
  },
};

const ecProductClick: SampleEvent = {
  type: "ec.productClick",
  payload: {
    position: 1,
    responseId: "c708f376-3eba-47a6-a7b7-7934fdd2f6cd",
    currency: "CAD",
    product,
  },
};

const ecProductView: SampleEvent = {
  type: "ec.productView",
  payload: {
    currency: "GBP",
    product,
  },
};

const ecPurchase: SampleEvent = {
  type: "ec.purchase",
  payload: {
    currency: "USD",
    products,
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

export const events: SampleEvent[] = [
  ecCartAction,
  ecProductClick,
  ecProductView,
  ecPurchase,
  itemClick,
  itemView,
];
