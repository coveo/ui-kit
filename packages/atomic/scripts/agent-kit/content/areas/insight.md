An insight panel is a search interface embedded in an agent's workspace, typically a Salesforce or ServiceNow case view. It wraps everything in `atomic-insight-interface`, lays it out with `atomic-insight-layout`, and uses the `atomic-insight-*` variants of the search components.

```html
<atomic-insight-interface>
  <atomic-insight-layout>
    <atomic-layout-section section="search">
      <atomic-insight-search-box></atomic-insight-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      <atomic-insight-result-list>
        <atomic-insight-result-template>
          <template>
            <atomic-result-section-title>
              <atomic-result-link></atomic-result-link>
            </atomic-result-section-title>
          </template>
        </atomic-insight-result-template>
      </atomic-insight-result-list>
    </atomic-layout-section>
  </atomic-insight-layout>
</atomic-insight-interface>
```

Initialize it with `initialize({organizationId, accessToken, insightId})`, where the insight id identifies the Insight Panel configuration in the platform, and run `executeFirstSearch()`.
