---
'@coveo/headless': patch
---

Remove commerce location facets

Location facets were released behind a platform feature flag and were never adopted. The feature and its flags are being retired, so all support is removed from `@coveo/headless`.

**Semantically Breaking changes in `@coveo/headless`:**

- Removed the location facet controller and its actions: `buildCommerceLocationFacet`, `loadLocationFacetActions`, `LocationFacetActionCreators`, `toggleSelectLocationFacetValue`, and `ToggleSelectLocationFacetValuePayload`.
- Removed the location facet types: `LocationFacet`, `LocationFacetState`, `LocationFacetOptions`, `LocationFacetValue`, `LocationFacetValueRequest`, `LocationFacetRequest`, and `LocationFacetResponse`.
- Removed `'location'` from the `FacetType` union. A facet response with `type: 'location'` is no longer recognized, and `FacetGenerator` no longer creates a controller for it.
- Removed the `lf` key from the `Parameters` type and the `lf-*` URL search parameter. A URL that still contains `lf-*` parameters is now ignored instead of restoring location facet selections.

The user location context API is **not** removed. `Context.setLocation`, `UserLocation`, and `SetLocationPayload` are unchanged, and `context.user.latitude` and `context.user.longitude` are still sent on commerce requests. Only the facet built on top of that data is removed.

> [!NOTE]
> While the change is semantically breaking from a pure JavaScript/TypeScript API perspective, we decided that the removal of the API of a defunct *experimental* feature falls within the realm of acceptable breaking changes within a major.
