import externalCartService from '@/external-services/external-cart-service';

export const action = async () => {
  return await externalCartService.purchase();
};
