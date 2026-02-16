import type {ActionFunctionArgs} from 'react-router';
import externalCartService from '@/external-services/external-cart-service';

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const uniqueId = formData.get('uniqueId')!.toString();
  const productName = formData.get('productName')!.toString();
  const pricePerUnit = Number.parseFloat(
    formData.get('pricePerUnit')!.toString()
  );

  return await externalCartService.removeItem({
    uniqueId,
    productName,
    pricePerUnit,
  });
};
