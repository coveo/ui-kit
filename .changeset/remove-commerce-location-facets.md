---
'@coveo/headless': major
'@coveo/atomic': patch
---

Remove commerce location facets

Location facets were released behind a platform feature flag and were never adopted. The feature and its flags are being retired, so all support is removed from `@coveo/headless`.

**Breaking changes in `@coveo/headless`:**

- Removed the location facet controller and its actions: `buildCommerceLocationFacet`, `loadLocationFacetActions`, `LocationFacetActionCreators`, `toggleSelectLocationFacetValue`, and `ToggleSelectLocationFacetValuePayload`.
- Removed the location facet types: `LocationFacet`, `LocationFacetState`, `LocationFacetOptions`, `LocationFacetValue`, `LocationFacetValueRequest`, `LocationFacetRequest`, and `LocationFacetResponse`.
- Removed `'location'` from the `FacetType` union. A facet response with `type: 'location'` is no longer recognized, and `FacetGenerator` no longer creates a controller for it.
- Removed the `lf` key from the `Parameters` type and the `lf-*` URL search parameter. A URL that still contains `lf-*` parameters is now ignored instead of restoring location facet selections.
- Removed the user location context API: `Context.setLocation`, `UserLocation`, and `SetLocationPayload`. As a result, `context.user.latitude` and `context.user.longitude` are no longer sent on commerce requests.

`@coveo/atomic` gets a patch: the only changes are an internal breadcrumb value type and a test fixture. No public Atomic API changes.
