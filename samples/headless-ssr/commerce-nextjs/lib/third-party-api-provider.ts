/**
 * @file
 * A fake 3rd party API that returns the availability of a product based on its id.
 *
 * The returned value of this fake API are random.
 * The "response time" of the API is however rigged to illustrate various scenarios:
 *  - The first and third request will respond 'fast' (<200ms) to represent the most optimistic cases
 *  - The fifth & sixth request will respond 'very slow' (>5s) to represent the worst case scenario case
 *  - The other request will respond between 500 & 1000ms.
 * Every 10 requests, the counter of requests will reset.
 */

export enum Availability {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  OutOfStock = 'out-of-stock',
}

const availabilities = Object.values(Availability);

let requestCounter = 0;

export const fetchAvailability = async (
  productId: string
): Promise<Availability> => {
  requestCounter++;
  requestCounter %= 10;
  const stableAvailability =
    availabilities[Math.floor(Math.random() * availabilities.length)];
  let latency = Math.random() * 500 + 500;
  if (requestCounter === 1 || requestCounter === 3) {
    latency = Math.random() * 200;
  }
  if (requestCounter === 5 || requestCounter === 6) {
    latency += 4.5e3;
  }
  return await new Promise((resolve) => {
    // Simulate fast network latency
    setTimeout(() => {
      console.log(
        `🔗 Fetched availability for product ${productId}: ${stableAvailability}`
      );
      resolve(stableAvailability as Availability);
    }, latency);
  });
};
