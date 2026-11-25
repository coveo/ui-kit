---
'@coveo/atomic': minor
---

Add a public `clickLink()` method to `atomic-result-link`, `atomic-product-link` and `atomic-ipx-result-link`. It clicks the link the component renders and logs the click, the same way a user would. Pass `{newTab: true}` to open the link in a new tab. Use it instead of querying the `a` element inside these components, whose markup will change in version 4. `atomic-result`, `atomic-recs-result`, `atomic-product` and the instant results components now use it.
