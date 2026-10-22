A recommendation block for a non-commerce index wraps an `atomic-recs-list` in `atomic-recs-interface`. The list names the recommendation model configured in the platform and renders each item through an `atomic-recs-result-template`.

```html
<atomic-recs-interface>
  <atomic-recs-list
    recommendation="Recommendation"
    number-of-recommendations="5"
    label="Recommended for you"
  >
    <atomic-recs-result-template>
      <template>
        <atomic-result-section-title>
          <atomic-result-link></atomic-result-link>
        </atomic-result-section-title>
        <atomic-result-section-excerpt>
          <atomic-result-text field="excerpt"></atomic-result-text>
        </atomic-result-section-excerpt>
      </template>
    </atomic-recs-result-template>
  </atomic-recs-list>
</atomic-recs-interface>
```

Initialize it with `initialize({organizationId, accessToken})` and run `getRecommendations()`. For product recommendations on a commerce index, use `atomic-commerce-recommendation-interface` and `atomic-commerce-recommendation-list` from the commerce area instead.
