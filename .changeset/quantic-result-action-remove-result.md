---
'@coveo/quantic': major
---

`QuanticResultAction` no longer has a `result` property. The property did nothing since the component stopped sending the result in its action event. Remove `result={result}` from every `c-quantic-result-action` in your components.
