import '@coveo/atomic/themes/coveo.css';
import type {AppProps} from 'next/app';

export default function CustomApp({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}
