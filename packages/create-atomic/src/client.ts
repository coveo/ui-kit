import 'isomorphic-fetch';
import 'abortcontroller-polyfill';
import {PlatformClient} from '@coveo/platform-client';
import {HttpsProxyAgent} from 'https-proxy-agent';

export function createPlatformClient(
  host: string,
  organizationId: string,
  accessToken: string
) {
  const globalRequestSettings: Record<string, unknown> = {};
  const proxyServer = process.env.https_proxy || process.env.HTTPS_PROXY;
  if (proxyServer) {
    const httpsProxyAgent = new HttpsProxyAgent(proxyServer);
    globalRequestSettings.agent = httpsProxyAgent;
  }

  return new PlatformClient({
    globalRequestSettings,
    organizationId,
    accessToken,
    host,
  });
}
