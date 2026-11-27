---
'@coveo/atomic': minor
---

Add the `currency-fields` property to `atomic-commerce-interface`, which lets you format additional numeric fields as prices. Facet values, breadcrumbs, and the minimum of the custom range input already treat `ec_price` and `ec_promo_price` as prices, using the currency of the commerce context. Fields listed in `currency-fields` now get the same treatment, and `ec_price` and `ec_promo_price` always do, whether or not you list them.

```html
<atomic-commerce-interface currency-fields='["my_price_field"]'>
  ...
</atomic-commerce-interface>
```
