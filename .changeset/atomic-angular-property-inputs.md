---
'@coveo/atomic-angular': patch
---

Assign inputs as properties instead of attributes, so array and object inputs reach the underlying Atomic component intact.

`proxyInputs` wrote every input through `setAttribute`. Attributes are strings, so an array binding such as `[fieldsToInclude]="['snrating']"` arrived as the string `"snrating"` and the component parsed it back as an empty array, while `[allowedValues]` arrived as `null`. `atomic-facet` then threw `TypeError: Cannot read properties of null (reading 'length')` and never rendered. Strings and numbers were unaffected, so the failure only appeared for the inputs that take structured values.

Inputs are now assigned to the element as properties, which preserves their type.

This also removes the wrapper's import of `@coveo/atomic/custom-elements-manifest`. It existed only to map property names to attribute names for the `setAttribute` call, and that mapping has no remaining consumer. The manifest is a 1.7 MB JSON document that bundlers inline into the application, so removing the import takes roughly 1 MB out of every consumer's bundle.
