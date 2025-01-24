export async function defineCustomElements() {
  return import('../dist/atomic-hosted-page.esm.js')
    .then(() => {
      console.log('Custom elements loader executed successfully.');
    })
    .catch((error) => {
      console.error('Failed to load custom elements:', error);
    });
}
