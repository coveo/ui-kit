---
"@coveo/headless": patch
---

Fix `fetchMoreProducts` skipping a product page in commerce product listing and search when cumulative spotlight content reaches `perPage`. The next page is now derived from the accumulated product count (excluding spotlight content) so the requested page stays an integer.
