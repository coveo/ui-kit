import '@coveo/atomic/dist/atomic/themes/coveo.css';
import type {AppProps} from 'next/app';
import '../styles/globals.css';

function MyApp({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
