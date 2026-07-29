import {type HttpHandler, HttpResponse, http} from 'msw';

const atomicCdnBase = 'https://static.cloud.coveo.com/atomic/v3.60.0';
const searchInterfaceId = 'mocked-hosted-page-search-interface';

const mockOrganizationId = 'mockorg';
const mockAccessToken = 'mock-access-token';

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

const javascript = [
  {isModule: true, url: `${atomicCdnBase}/atomic.esm.js`},
  {
    isModule: false,
    inlineContent: `(async () => {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = document.getElementById('${searchInterfaceId}');
  await searchInterface.initialize({
    accessToken: '${mockAccessToken}',
    organizationId: '${mockOrganizationId}',
  });
  searchInterface.executeFirstSearch();
})();`,
  },
];

const css = [{url: `${atomicCdnBase}/themes/coveo.css`}, {inlineContent: 'body { margin: 0; }'}];

const hostedPage = (pageId: string) => ({
  id: pageId,
  name: 'mocked-hosted-page',
  html,
  javascript,
  css,
});

const adminEndpoint = 'https://:orgId.admin.org.coveo.com/rest/organizations/:orgId';

const respondWithHostedPage = ({params}: {params: Record<string, string | readonly string[]>}) =>
  HttpResponse.json(hostedPage(String(params.pageId)));

export const hostedPageHandlers: HttpHandler[] = [
  http.get(`${adminEndpoint}/searchpage/v1/interfaces/:pageId/json`, respondWithHostedPage),
  http.get(`${adminEndpoint}/searchinterfaces/:pageId/hostedpage/v1`, respondWithHostedPage),
  http.get(`${adminEndpoint}/hostedpages/:pageId`, respondWithHostedPage),
];
