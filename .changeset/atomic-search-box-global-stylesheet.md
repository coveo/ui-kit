---
'@coveo/atomic': patch
---

Stop embedding a second copy of the global Tailwind stylesheet in `atomic-search-box`, `atomic-commerce-search-box` and `atomic-insight-result-children`. Each of them is about 46 KB smaller, and the page has one less large stylesheet to parse for each of them.
