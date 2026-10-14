---
'@coveo/headless': patch
---

Remove a controller's listener from the engine when its last subscriber unsubscribes, whatever the order in which its subscribers unsubscribe. Before, the listener was only removed when the first subscriber was also the last to unsubscribe. Otherwise it stayed registered, and the controller kept comparing its state on every state change for the rest of the session.
