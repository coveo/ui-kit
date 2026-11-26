---
'@coveo/atomic': major
---

Atomic components display their errors in one way. Nine components that received errors without displaying them now show the error box, the timeframe facets display the error of an invalid `atomic-timeframe` child, and 35 components wait for their interface to initialize before they show an error, like the others. The layouts and `atomic-commerce-recommendation-interface` no longer declare an `error` that nothing sets.

See the upgrade guide, "Component errors that used to be swallowed" and "Component errors shown once the interface initializes".
