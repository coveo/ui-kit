---
'@coveo/headless': minor
---

Added `proxyBaseUrl` support for GenAI streaming endpoints:

- **Answer API**: Configure `knowledge.proxyBaseUrl` in the search engine or insight engine configuration to route Answer API requests (`/answer/v1/configs/{id}/generate`) through a proxy server.
- **Search API CRGA**: The `machinelearning/streaming` endpoint now correctly honors the existing `search.proxyBaseUrl` configuration, which was previously ignored.
