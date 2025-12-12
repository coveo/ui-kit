export const insertMetaTags = () => {
  const head = document.getElementsByTagName('head')[0];
  if (head) {
    head.innerHTML += `
      <meta name="color-scheme" content="light dark">
      <meta name="theme-color" content="light">
      <meta name="docsSiteUrl" content="https://docs.coveo.com">
      <meta name="docsSiteBaseUrl" content="/en">
      `;
  }
};
