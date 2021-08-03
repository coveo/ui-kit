import '../styles/globals.css';

import App from 'next/app';

class RootApp extends App {
  render() {
    const {Component, pageProps} = this.props;
    return (
      <>
        <Component {...pageProps} />
      </>
    );
  }
}

export default RootApp;
