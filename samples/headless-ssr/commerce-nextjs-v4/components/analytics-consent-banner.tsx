'use client';

import {CLIENT_ID_COOKIE_NAME} from '@coveo/headless-react/ssr-commerce-next';
import {useRouter} from 'next/navigation';
import {ANALYTICS_CONSENT_COOKIE_NAME} from '@/lib/analytics-consent';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const setCookie = (name: string, value: string) => {
  // oxlint-disable-next-line no-document-cookie -- the Cookie Store API is not available in every browser
  document.cookie = `${name}=${value};path=/;max-age=${ONE_YEAR_IN_SECONDS};SameSite=Lax`;
};

/**
 * Asks the visitor whether Coveo may collect analytics, and remembers the answer in a cookie that the
 * proxy (`proxy.ts`) reads. It stands for your consent tool.
 */
export default function AnalyticsConsentBanner() {
  const router = useRouter();

  const answer = (consent: 'granted' | 'denied') => {
    setCookie(ANALYTICS_CONSENT_COOKIE_NAME, consent);
    if (consent === 'granted') {
      // The refresh below sends several requests at once. Creating the client ID here gives them all
      // the same one, where the proxy would mint one per request.
      setCookie(CLIENT_ID_COOKIE_NAME, crypto.randomUUID());
    }
    // Renders the page again on the server, so an accepted visitor is tracked from this page on.
    router.refresh();
  };

  return (
    <div role="region" aria-label="Analytics consent">
      <span>This store uses a cookie to measure how visitors search and shop. </span>
      <button type="button" onClick={() => answer('granted')}>
        Accept analytics
      </button>
      <button type="button" onClick={() => answer('denied')}>
        Decline analytics
      </button>
    </div>
  );
}
