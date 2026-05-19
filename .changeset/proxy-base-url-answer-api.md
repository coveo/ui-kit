---
'@coveo/headless': minor
---

Added `proxyBaseUrl` support for GenAI streaming endpoints:

- **Answer API**: Configure `knowledge.proxyBaseUrl` in the search engine or insight engine configuration to route Answer API requests (`/rest/organizations/{org}/answer/v1/configs/{id}/generate`) through a proxy server.
- **Search API CRGA**: The `/rest/organizations/{org}/machinelearning/streaming/{streamId}` endpoint now correctly honors the existing `search.proxyBaseUrl` configuration, which was previously ignored.
