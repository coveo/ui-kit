export function loadProduct(): {
  name: string;
  price: number;
  productId: string;
} | null {
  try {
    const pathEncodedProductInformation = window.location.pathname
      .split('/product/')[1]
      .split('/');

    if (pathEncodedProductInformation.length !== 3) {
      return null;
    }

    const productId = pathEncodedProductInformation[0];
    const name = decodeURI(pathEncodedProductInformation[1]);
    const price = Number(pathEncodedProductInformation[2]);

    return {name, price, productId};
  } catch (err) {
    console.error('Failed to load product from local storage', err);
    return null;
  }
}
