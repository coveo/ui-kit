'use server';

import {ContextOptions} from '@coveo/headless/ssr-commerce';
import {cookies} from 'next/headers';

export async function getContext() {
  return {
    language: cookies().get('language')?.value || 'en',
    country: cookies().get('country')?.value || 'US',
    currency:
      (cookies().get('currency')?.value as ContextOptions['currency']) || 'USD',
  };
}
