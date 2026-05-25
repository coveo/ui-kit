/* eslint-env browser */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2 || name.includes('OptanonConsent')) {
    // explanation for || name.includes('OptanonConsent'):
    // In staging, since its a subdomain of .coveo.com, the OptanonConsent cookie can be
    // present twice: one from the prod site and one from staging.
    // In this scenario, "parts" will be of length 3, so we must return the 1-indexed part
    // associated to the current domain (staging).
    return parts.pop().split(';').shift();
  }
}

export const onetrustPreferencesGroup = 'ot';

const onetrustCookieName = 'OptanonConsent';

function getOneTrustActiveGroups() {
  const onetrustCookie = getCookie(onetrustCookieName);
  if (onetrustCookie === undefined || onetrustCookie === '') {
    return undefined;
  }
  const onetrustGroupRaw = onetrustCookie.match('groups=(.*?)&')[0];
  const formattedActiveGroups = onetrustGroupRaw
    .replaceAll('%3A', ':')
    .replaceAll('%2C', ',')
    .replace('groups=', '')
    .replaceAll('&', '');
  return formattedActiveGroups;
}
/**
 *
 * @param {string} groupsToVerify the onetrust groups to verify, represented by a
 *                                 single string separated by commas.
 *                                 e.g.: 'C0002'
 *                                 e.g.: 'C0002,C0003'
 *
 * @returns true if all the groups to verify are active, false otherwise.
 */
export function isActiveGroup(groupsToVerify) {
  const list = groupsToVerify.split(',');
  const activeGroups = getOneTrustActiveGroups();
  if (activeGroups === undefined) {
    return false;
  }
  if (list.some((group) => !activeGroups.includes(`${group}:1`))) {
    return false;
  }
  return true;
}

// Auto-initialize docs analytics when OneTrust functional cookies are active.
// Uses window.docsAnalytics (our event-handler wrapper) which in turn delegates
// to the Amplitude Browser SDK via window.amplitude.
(function initAnalyticsWhenAllowed() {
  try {
    const analytics = window.docsAnalytics;
    if (!analytics) return;

    function handleConsentChange() {
      if (isActiveGroup('C0003')) {
        analytics.initAmplitude();
      } else {
        analytics.setOptOut(true);
      }
    }

    // If C0003 consent already present (returning visitor), init immediately
    if (isActiveGroup('C0003')) {
      analytics.initAmplitude();
      return;
    }

    // OneTrust integrations in this repo rely on the global OptanonWrapper callback.
    // Preserve any existing wrapper and run the analytics consent handler after it.
    const existingOptanonWrapper = window.OptanonWrapper;
    window.OptanonWrapper = function () {
      if (typeof existingOptanonWrapper === 'function') {
        existingOptanonWrapper();
      }
      handleConsentChange();
    };

    // Keep listening for the custom event as a compatibility fallback in case
    // another integration dispatches it.
    window.addEventListener('consent.onetrust', handleConsentChange);
  } catch (e) {
    // don't break the page if analytics fails
    // eslint-disable-next-line no-console
    console.warn('[docs-analytics] Failed to initialize', e);
  }
})();
