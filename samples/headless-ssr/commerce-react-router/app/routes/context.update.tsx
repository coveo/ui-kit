import type {ActionFunctionArgs} from 'react-router';
import externalContextService from '@/external-services/external-context-service';

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const newContext = {
    language: formData.get('language')!.toString(),
    country: formData.get('country')!.toString(),
    currency: formData.get('currency')!.toString(),
  };

  await externalContextService.setContextInformation(newContext);

  return newContext;
};
