import {describe, it, expect} from 'vitest';
import {getClientId} from './utilities';

describe('#getClientId', () => {
  it('should generate a valid UUID', () => {
    const shopifyCookie = 'shopify_cookie_value';

    const clientId = getClientId(shopifyCookie);

    expect(clientId.length).toBe(36);
    expect(clientId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('should generate different UUIDs for different inputs', () => {
    const shopifyCookie1 = 'shopify_cookie_value_1';
    const shopifyCookie2 = 'shopify_cookie_value_2';

    const clientId1 = getClientId(shopifyCookie1);
    const clientId2 = getClientId(shopifyCookie2);

    expect(clientId1).not.toBe(clientId2);
  });
  it('should generate the same UUID for the same input', () => {
    const shopifyCookie = 'shopify_cookie_value';
    const clientId1 = getClientId(shopifyCookie);
    const clientId2 = getClientId(shopifyCookie);
    expect(clientId1).toBe(clientId2);
  });
});
