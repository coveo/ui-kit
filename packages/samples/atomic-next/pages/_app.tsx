import '../styles/globals.css';
import '@coveo/atomic/dist/atomic/themes/coveo.css';

import type {AppProps} from 'next/app';

function MyApp({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
