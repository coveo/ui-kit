export type ConverseRequestBody = {
  trackingId: string | undefined;
  language: string | undefined;
  country: string | undefined;
  currency: string | undefined;
  clientId: string | undefined;
  message: string;
  context: ConverseRequestBodyContext;
  conversationSessionId: string | undefined;
  conversationToken: string | undefined;
  targetEngine: 'AGENT_CORE';
};

type ConverseRequestBodyUser = {
  userAgent: string | null | undefined;
};

type ConverseRequestBodyView = {
  url: string | null | undefined;
  referrer: string | null | undefined;
};

type ConverseRequestBodyCartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type ConverseRequestBodyContext = {
  user: ConverseRequestBodyUser;
  view: ConverseRequestBodyView;
  cart: ConverseRequestBodyCartItem[];
};
