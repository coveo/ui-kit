import {CartItem} from '@coveo/headless-react/ssr-commerce';

export default async function getCart(): Promise<CartItem[]> {
  'use server';
  return [{name: 'item1', price: 10, quantity: 1, productId: 'xxx'}];
}
