import externalCartAPI from '@/client/external-cart-api';
import {ActionFunctionArgs} from '@remix-run/node';

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const uniqueId = formData.get('uniqueId')!.toString();
  const productName = formData.get('productName')!.toString();
  const pricePerUnit = Number.parseFloat(
    formData.get('pricePerUnit')!.toString()
  );

  return await externalCartAPI.addItem({
    uniqueId,
    productName,
    pricePerUnit,
  });
};
