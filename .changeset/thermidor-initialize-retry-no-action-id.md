---
'@coveo/thermidor': patch
---

`initialize` and retried actions no longer send the unused A2-UI `actionId` and `wantResponse` fields either; 0.7.0 only stopped sending them with first-sent actions.
