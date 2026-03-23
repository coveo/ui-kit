# @coveo/documentation

This is a typedoc plugin. It ensures that the documentation generated adheres to our styling guidelines. 

It is used by
- `@coveo/headless`

## Navigation
This plugin also deviates from the standard typedoc navigation patterns. It allows for top level documents that are ungrouped and it removes the standard
`Documents` tab for ungrouped documents. It also allows for groups to have a mixed of documents and folders based on Category, as opposed to forcing
each document in a group that has categories to _be_ categorized or otherwise lumped together into an `Others` folder.

The sorting of the navigation be specified, both for the top level and optionally by for groups.

NOTE: when specifying the sorting for groups, the key must be in lowercase not the actual casing of the document title.


## Callouts

This plugin also provides the functionality for adding `callouts` to code that is included into typedoc markdown files via the `@includeCode`
directive in `*.md` and `*.mdx` files.

By adding an inline comment - not a block comment - with the word `callout` the content encapsulated in the following square brackets will appear in
an `<ol>` below the code fence. The comment itself will be replaced by an element that is an anchor tag to the `<li>` created

For example,

```javascript
const searchEngine = buildSearchEngine({
  configuration: getSampleSearchEngineConfiguration(), // callout[Refer to <a href="#instantiating-the-engine-and-the-controller">Instantiating the engine and the controller</a> to better understand your `searchEngine` controller.]
});
```

These callouts can contain `<a>` tags for links, but all other HTML will be stripped out