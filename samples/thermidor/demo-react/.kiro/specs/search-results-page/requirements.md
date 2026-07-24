# Requirements Document

## Introduction

The Search Results Page is the primary view for displaying product search results in the `demo-react` Thermidor sample application. When the backend routes a user prompt as a commerce search or search query (via `ConverseController`), the app transitions to this page. It presents a three-column layout with a compact header (PromptInput only), a sidebar placeholder for future facets, and a main content area with a product grid and pagination controls. The page uses the persisted `RoutedInterface` from the AppShell to build `ProductListController` and `PaginationController` instances.

## Glossary

- **SearchResultsPage**: The React component responsible for rendering the search results view including layout, product grid, and pagination.
- **RoutedInterface**: A union type (`{ useCase: 'commerceSearch'; interface: CommerceInterface } | { useCase: 'search'; interface: SearchInterface }`) representing the interface created by the backend in response to a routed search query.
- **ProductListController**: A Thermidor controller built with `buildProductListController({interface})` that exposes a `products: Product[]` array from the search response.
- **PaginationController**: A Thermidor controller built with `buildPaginationController({interface})` that exposes page state (`page`, `pageSize`, `totalCount`, `totalPages`) and methods (`selectPage`, `setPageSize`).
- **SearchBoxController**: A Thermidor controller built with `buildSearchBoxController({interface})` that exposes the current `query` and provides `setQuery`/`submit` methods.
- **ProductCard**: A presentational component that renders a single product's image, name, brand, and price.
- **ProductGrid**: A layout component that arranges ProductCard instances in a responsive CSS grid.
- **Pagination**: A navigation component that renders page controls (previous, next, page numbers) based on PaginationController state.
- **QuerySummaryPlaceholder**: A temporary component displaying the current query and result count, implemented without a dedicated controller since no QuerySummaryController exists in Thermidor yet.
- **SortPlaceholder**: A non-functional dropdown element displaying a sort option label (e.g., "Sort by: Relevance"), positioned at the top-right of the product list area. It serves as a visual placeholder until a sort controller is available in Thermidor.
- **AppShell**: The parent component that manages the persisted RoutedInterface ref and passes it to SearchResultsPage.
- **useBuildController**: A React hook that instantiates a Thermidor controller once (via `useRef`) and subscribes to its state via `useSyncExternalStore`.
- **PageSizeSelector**: A dropdown control positioned adjacent to the Pagination component that allows users to change the number of products displayed per page by calling `paginationController.setPageSize(size)`.

## Requirements

### Requirement 1: Page Layout Structure

**User Story:** As a user, I want the search results page to have a clear visual hierarchy with a header, sidebar, and main content area, so that I can easily navigate and find products.

#### Acceptance Criteria

1. WHEN the SearchResultsPage renders, THE SearchResultsPage SHALL display a header bar containing only a PromptInput component (the same component used on the landing page) configured without suggestion pills and with a single-row text area. The PromptInput SHALL occupy one third of the total available width and be horizontally centered within the header. The header SHALL NOT contain a logo element.
2. WHEN the SearchResultsPage renders, THE SearchResultsPage SHALL display a sidebar region positioned to the left of the main content area, containing the visible text "Facets (coming soon)".
3. WHEN the SearchResultsPage renders, THE SearchResultsPage SHALL display a main content area with the following top-to-bottom layout: a top row containing the QuerySummaryPlaceholder positioned at the left and the SortPlaceholder positioned at the right, followed by the ProductGrid component, followed by a bottom row with the Pagination aligned to the left and the PageSizeSelector aligned to the right.
4. THE SearchResultsPage SHALL use a 12-column proportional grid layout with a 24px column gap: 1/12 empty left gutter, 2/12 facet sidebar, 8/12 main content, 1/12 empty right gutter. The header spans the full width above all columns.
5. THE SearchResultsPage SHALL use CSS Modules for all styling.

### Requirement 2: Product Grid Display

**User Story:** As a user, I want to see search results displayed as a grid of product cards, so that I can visually browse available products.

#### Acceptance Criteria

1. WHEN the ProductListController state contains one or more products, THE ProductGrid SHALL render exactly one ProductCard for each product in the `products` array, preserving the array order.
2. WHEN the ProductListController state contains zero products, THE ProductGrid SHALL display a visible text message indicating no results were found.
3. THE ProductCard SHALL display the product image sourced from `ec_thumbnails[0]` (falling back to `ec_images[0]` if `ec_thumbnails` is empty or undefined), `ec_name`, `ec_brand`, and `ec_price` formatted as a currency value.
4. IF a product has neither `ec_thumbnails[0]` nor `ec_images[0]` available, THEN THE ProductCard SHALL render a placeholder image element of the same dimensions as a product image.
5. WHEN a product has an `ec_promo_price` that is both defined and numerically less than `ec_price`, THE ProductCard SHALL display the original `ec_price` with a visible strikethrough style and the `ec_promo_price` as the current price.
6. THE ProductGrid SHALL arrange ProductCard instances in a responsive CSS grid layout that displays a minimum of 1 column on viewports narrower than 600px and a maximum of 4 columns on viewports 1200px or wider.
7. IF `ec_name` text exceeds 2 lines within the ProductCard layout, THEN THE ProductCard SHALL truncate the text with an ellipsis and expose the full name via a `title` attribute.
8. THE ProductCard SHALL display a pointer cursor on hover to indicate interactivity.

### Requirement 3: Pagination Controls

**User Story:** As a user, I want pagination controls so that I can navigate through multiple pages of search results.

#### Acceptance Criteria

1. WHEN the PaginationController state has `totalPages` greater than one, THE Pagination component SHALL render a previous-page button (chevron back icon), a next-page button (chevron forward icon), and numbered page buttons.
2. WHEN the PaginationController state has `totalPages` equal to one or zero, THE Pagination component SHALL not render any navigation controls.
3. WHEN the user clicks a numbered page button, THE Pagination component SHALL call `paginationController.selectPage(page)` with the zero-indexed page number corresponding to that button.
4. WHEN the user clicks the next-page button, THE Pagination component SHALL call `paginationController.selectPage(currentPage + 1)`.
5. WHEN the user clicks the previous-page button, THE Pagination component SHALL call `paginationController.selectPage(currentPage - 1)`.
6. WHILE the current page is the first page (page equals zero), THE Pagination component SHALL disable the previous-page button to prevent user activation.
7. WHILE the current page is the last page (page equals `totalPages - 1`), THE Pagination component SHALL disable the next-page button to prevent user activation.
8. WHEN `totalPages` exceeds 5, THE Pagination component SHALL display at most 5 visible page number buttons with an ellipsis indicator for omitted ranges.
9. THE Pagination component SHALL be aligned to the left within the bottom row of the main content area.

### Requirement 4: Controller Integration with Persisted RoutedInterface

**User Story:** As a developer, I want the search results page to build its controllers from the persisted routed interface, so that the page displays real data from the backend.

#### Acceptance Criteria

1. WHEN the SearchResultsPage mounts with a RoutedInterface, THE SearchResultsPage SHALL call `buildProductListController({interface: routedInterface.interface})` via the `useBuildController` hook and render product data from the resulting controller state.
2. WHEN the SearchResultsPage mounts with a RoutedInterface, THE SearchResultsPage SHALL call `buildPaginationController({interface: routedInterface.interface})` via the `useBuildController` hook and render pagination controls from the resulting controller state.
3. WHEN the SearchResultsPage mounts with a RoutedInterface, THE SearchResultsPage SHALL call `buildSearchBoxController({interface: routedInterface.interface})` via the `useBuildController` hook and pre-fill the header input with the current query from the controller state.
4. THE SearchResultsPage SHALL use the `useBuildController` hook to instantiate each controller exactly once per mount, relying on the hook's internal `useRef` to prevent duplicate factory invocations on re-renders.
5. WHEN the RoutedInterface changes identity (a new routed turn produces a new interface), THE AppShell SHALL call `dispose()` on the previous interface, store the new RoutedInterface in its ref, and cause the SearchResultsPage to remount with fresh controllers by changing the React key.
6. IF the RoutedInterface provided to SearchResultsPage is `null` or `undefined` at mount time, THEN THE SearchResultsPage SHALL NOT call any controller build functions and SHALL render nothing (return `null`).
7. WHEN the SearchResultsPage unmounts (due to a view transition away from search), THE SearchResultsPage SHALL NOT dispose the RoutedInterface, since the AppShell retains ownership and may re-render SearchResultsPage with the same interface on navigation back.

### Requirement 5: Query Summary Placeholder

**User Story:** As a user, I want to see a summary of my current search query and result count, so that I know what I searched for and how many results exist.

#### Acceptance Criteria

1. WHEN the PaginationController state `totalCount` is greater than 0, THE QuerySummaryPlaceholder SHALL display text in the format "Products **{first}**-**{last}** of **{total}** for **{query}**" where `{first}` is `firstResult + 1`, `{last}` is `firstResult + productCount` (the actual number of products displayed on the current page), `{total}` is the locale-formatted `totalCount`, and `{query}` is the search query truncated to 100 characters. The values for first, last, total, and query SHALL be rendered in bold (`<strong>` elements).
2. IF the SearchBoxController state `query` is an empty string AND totalCount is greater than 0, THEN THE QuerySummaryPlaceholder SHALL omit the "for {query}" portion and display only "Products **{first}**-**{last}** of **{total}**".
3. IF the PaginationController state `totalCount` is 0 AND the SearchBoxController state `query` is non-empty, THEN THE QuerySummaryPlaceholder SHALL display "No results for **{query}**" with the query in bold.
4. IF both the SearchBoxController state `query` is an empty string AND the PaginationController state `totalCount` is 0, THEN THE QuerySummaryPlaceholder SHALL render nothing (empty output).
5. THE QuerySummaryPlaceholder SHALL receive `query`, `totalCount`, `firstResult`, `pageSize`, and `productCount` as props.
6. THE QuerySummaryPlaceholder SHALL be positioned at the top-left of the main content area, left-aligned within the top row.

### Requirement 6: Header Input Behavior

**User Story:** As a user, I want a compact search input in the header that lets me submit new queries or switch to conversation mode, so that I can refine my search without returning to the landing page.

#### Acceptance Criteria

1. THE SearchResultsPage header SHALL render the same PromptInput component used on the landing page, configured in a compact/header context with the suggestion dropdown configured for the 'search-results' context, displaying up to 3 sections.
2. WHEN the user submits a prompt through the header PromptInput, THE SearchResultsPage SHALL call the `onSubmit` callback (provided by AppShell), which routes through `controller.submit({prompt})` on the ConverseController — the same submission path used on the landing page.
3. WHEN the user selects a suggestion in a section mapped to "submit" in SECTION_ACTIONS, THE SearchResultsPage SHALL call `onSubmit` with the suggestion's label text, routing through the ConverseController.
4. WHEN the user selects a suggestion in a section mapped to "toast" in SECTION_ACTIONS, THE SearchResultsPage SHALL display a toast notification with the text "Not supported yet" that auto-dismisses after 3 seconds.
5. WHEN the user types in the header PromptInput, THE suggestion dropdown SHALL update its displayed sections based on the current input value passed to the `useSuggestions` hook.

### Requirement 7: Facet Sidebar Placeholder

**User Story:** As a user, I want to see a designated area for filtering options, so that I know filtering will be available in the future.

#### Acceptance Criteria

1. WHEN the SearchResultsPage renders, THE SearchResultsPage SHALL display a sidebar area on the left side of the content region with a visible boundary and the text "Facets (coming soon)".
2. THE sidebar placeholder SHALL occupy a proportional width of 2/12 of the available page width (as defined by the page grid) and SHALL NOT cause the main content area to shift or resize when present.
3. WHEN the viewport width is below 768px, THE sidebar placeholder SHALL be hidden to preserve content area usability.
4. THE sidebar placeholder SHALL be non-interactive — it SHALL NOT respond to click, focus, or other user input events.

### Requirement 8: Sort Placeholder

**User Story:** As a user, I want to see a sort control in the product list area, so that I know sorting will be available in the future.

#### Acceptance Criteria

1. WHEN the SearchResultsPage renders, THE SortPlaceholder SHALL display a bold "Sort by:" label to the left of a native `<select>` element showing "Relevance" as its only option, positioned at the top-right of the main content area, in the same row as the QuerySummaryPlaceholder.
2. WHEN the user clicks the SortPlaceholder select, THE SortPlaceholder SHALL display a toast notification with the text "Not supported yet" that auto-dismisses after 3 seconds.
3. THE SortPlaceholder SHALL use a native `<select>` element (matching the PageSizeSelector pattern) with 8px padding. The bold "Sort by:" label SHALL be outside the select, to its left, with 8px gap.
4. THE SortPlaceholder SHALL NOT trigger any controller actions or modify application state beyond displaying the toast notification.

### Requirement 9: Page Size Selector

**User Story:** As a user, I want to change how many products are displayed per page, so that I can view more or fewer results at once depending on my preference.

#### Acceptance Criteria

1. WHEN the SearchResultsPage renders, THE PageSizeSelector SHALL display a `<select>` element with the options 10, 25, and 50 as available page sizes.
2. THE PageSizeSelector SHALL reflect the current `paginationController.state.pageSize` as its selected value.
3. WHEN the user selects a different page size option, THE PageSizeSelector SHALL call `paginationController.setPageSize(newSize)` with the newly selected numeric value.
4. WHEN the user selects a different page size option, THE PageSizeSelector SHALL call `paginationController.selectPage(0)` to reset navigation to the first page.
5. THE PageSizeSelector SHALL be positioned to the right of the Pagination component, within the same horizontal row at the bottom of the main content area.
6. THE PageSizeSelector SHALL include a visible bold label "Products per page:" associated with the select element via an HTML `<label>` element for accessibility.
7. THE PageSizeSelector SHALL receive the `PaginationController` directly as a prop, following the same controller-passing pattern used by the Pagination and ProductGrid components.
