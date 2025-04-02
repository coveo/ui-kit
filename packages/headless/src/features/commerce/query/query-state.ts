export interface CommerceQueryState {
  query: string;
}

export const getCommerceQueryInitialState: () => CommerceQueryState = () => ({
  query: '',
});
