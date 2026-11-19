---
'@coveo/headless': patch
---

Removing sunsetted experimental feature: commerce location facets

Commerce location facets were an experimental feature behind a platform feature flag, and the feature is now retired. The `FacetGenerator` no longer creates location facet controllers, `lf-*` URL parameters are no longer restored, and facets of an unsupported type such as `location` are dropped from commerce responses.

`loadLocationFacetActions`, `LocationFacetActionCreators`, `ToggleSelectLocationFacetValuePayload`, `LocationFacet`, `LocationFacetState`, `LocationFacetValue` and `LocationFacetValueRequest` are still exported, so code that imports them keeps compiling. They are deprecated, have no effect, and will be removed in the next major version. Remove them from your code.

**Semantically Breaking changes in `@coveo/headless`:**

- Removed `'location'` from the `FacetType` union. Code that compares a facet type with `'location'` no longer compiles.
- Removed the `lf` key from the `Parameters` type. Code that builds `Parameters` with an `lf` key no longer compiles.

The user location context API is **not** removed. `Context.setLocation`, `UserLocation`, and `SetLocationPayload` are unchanged, and `context.user.latitude` and `context.user.longitude` are still sent on commerce requests.

> [!NOTE]
> While the change is semantically breaking from a pure JavaScript/TypeScript API perspective, we decided that the removal of the API of a defunct *experimental* feature falls within the realm of acceptable breaking changes within a major.
