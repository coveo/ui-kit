---
'@coveo/atomic': major
---

All Atomic components now display their errors the same way. Eight components used to swallow their errors and now show the error box, and `atomic-tab-manager` now shows the error of an invalid `atomic-tab` child. 35 components now wait for their interface to initialize before they show an error, like the others. The timeframe facets are ready to display the error of an invalid `atomic-timeframe` child, which will show once `atomic-timeframe` validation becomes fatal. The layouts and `atomic-commerce-recommendation-interface` no longer declare an `error` property, since nothing ever sets it.

See the upgrade guide, "Component errors that used to be swallowed" and "Component errors shown once the interface initializes".
