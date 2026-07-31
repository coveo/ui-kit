interface HostedPageJavascriptFile {
  isModule: boolean;
  inlineContent?: string;
  url?: string;
}

type HostedPageCss = {url: string} | {inlineContent: string};

export interface HostedPageResponse {
  id: string;
  name: string;
  html: string;
  javascript: HostedPageJavascriptFile[];
  css: HostedPageCss[];
}

export const atomicCdnBaseUrl = 'https://static.cloud.coveo.com/atomic/v3.60.0';

export const searchInterfaceId = 'mocked-hosted-page-search-interface';

export const organizationId = 'mockorg';

export const accessToken = 'mock-access-token';

const html = `<atomic-search-interface id="${searchInterfaceId}" analytics="false">
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box></atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-layout-section section="status">
        <atomic-query-summary></atomic-query-summary>
      </atomic-layout-section>
      <atomic-layout-section section="results">
        <atomic-result-list>
          <atomic-result-template>
            <template>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
            </template>
          </atomic-result-template>
        </atomic-result-list>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
</atomic-search-interface>`;

export const baseResponse: HostedPageResponse = {
  id: 'mocked-hosted-page-id',
  name: 'mocked-hosted-page',
  html,
  javascript: [
    {isModule: true, url: `${atomicCdnBaseUrl}/atomic.esm.js`},
    {
      isModule: false,
      inlineContent: `(async () => {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = document.getElementById('${searchInterfaceId}');
  await searchInterface.initialize({
    accessToken: '${accessToken}',
    organizationId: '${organizationId}',
  });
  searchInterface.executeFirstSearch();
})();`,
    },
  ],
  css: [{url: `${atomicCdnBaseUrl}/themes/coveo.css`}, {inlineContent: 'body { margin: 0; }'}],
};
