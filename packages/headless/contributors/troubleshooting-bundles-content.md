# Why are multiple Headless bundles delivered?

Coveo Headless is divided into several bundles, each catering to different use cases that can be powered by the Coveo platform. These bundles contain client-side features and code required to enhance the end-user experiences.

Optimizing performance is crucial, so it's important to minimize the size of each individual bundle and ensure they only include the necessary code, eliminating any "dead code."

For instance, a `recommendation` interface typically displays a small list of recommended documents from an index, often presented as a carousel. This interface usually doesn't include a search box or advanced filter capabilities for the end user.

When comparing the `recommendation` use case to a full `search` page use case, the former is a simpler interface and therefore requires less client-side code to power it.

However, due to the internal project architecture, unnecessary code can sometimes end up being included in a bundle. Taking the previous example, due to a complex import chain, there might be code related to the search box or query suggestions that unintentionally becomes part of the `recommendation` bundle.

# Analysis of Meta files

During the building process of Headless bundles using esbuild, `metafiles` are generated simultaneously and saved in the "dist" folder. This configuration can be found in `esbuild.mjs`.

After executing the command `pnpm run build`, you should find the available `metafiles` in the `dist` folder, such as `cdn/browser.esm.stats.json` or `cdn/case-assist/browser.esm.stats.json`.

These files contain metadata about the build process, specifically providing information about the files included in the final bundle and the reasons behind their inclusion.

# esbuild analyzer

To visually analyze these files, you can utilize the [esbuild analyzer](esbuild.github.io/analyze/).

Using the visualizer, you can manually inspect each file and identify any that should not be part of a specific bundle.

For example, if certain files or modules related to `query-suggest` end up in the `recommendation` bundle, the visual analyzer can be used to investigate the import chain that results in the pollution of the `recommendation` bundle.
