const API_KEY_PREFIX = 'xx';

export const isApiKey = (token?: string) => token?.startsWith(API_KEY_PREFIX) || false;
