import {createCookie} from 'react-router';

export const coveo_visitorId = createCookie('coveo_visitorId', {
  decode: (value) => {
    return btoa(JSON.stringify(value));
  },
});

export const coveo_capture = createCookie('coveo_capture', {
  decode: (value) => {
    return btoa(JSON.stringify(value));
  },
});

export const coveo_accessToken = createCookie('coveo_accessToken', {
  decode: (value) => {
    return btoa(JSON.stringify(value));
  },
});
