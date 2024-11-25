import externalCartAPI from '@/client/external-cart-api';

export const action = async () => {
  return await externalCartAPI.purchase();
};
