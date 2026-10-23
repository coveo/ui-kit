An in-product experience (IPX) is a search experience embedded in an application: a button opens it in a modal (`atomic-ipx-modal` with `atomic-ipx-button`), or it sits in the page (`atomic-ipx-embedded`). Both live inside an `atomic-search-interface` and reuse the search components, with `atomic-ipx-*` variants for the pieces that differ.

```html
<atomic-search-interface>
  <atomic-ipx-embedded>
    <div slot="header">
      <atomic-layout-section section="search">
        <atomic-search-box></atomic-search-box>
      </atomic-layout-section>
    </div>
    <div slot="body">
      <atomic-result-list>
        <atomic-result-template>
          <template>
            <atomic-result-section-title>
              <atomic-ipx-result-link></atomic-ipx-result-link>
            </atomic-result-section-title>
          </template>
        </atomic-result-template>
      </atomic-result-list>
    </div>
  </atomic-ipx-embedded>
</atomic-search-interface>
```

See the `atomic-ipx-embedded` and `atomic-ipx-modal` pages for the slots each one offers. Initialization is the same as for a search page.
