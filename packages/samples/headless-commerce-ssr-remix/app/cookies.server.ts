import {createCookie} from '@remix-run/node';

export const coveo_visitorId = createCookie('coveo_visitorId', {
  decode: (value) => {
    return btoa(JSON.stringify(value));
  },
});
