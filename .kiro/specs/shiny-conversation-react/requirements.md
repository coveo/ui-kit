# Requirements Document

## Introduction

A polished, stakeholder-ready conversation sample application (`shiny-conversation-react`) that demonstrates the thermidor DX and implementation patterns. The application renders an agentic conversational experience with streaming message assembly, collapsible tool-use blocks, AGUI surface rendering with loading skeletons, and visually appealing product/article cards. All styles live in separate CSS files to preserve code readability.

## Glossary

- **Sample_App**: The `shiny-conversation-react` React application located at `samples/thermidor/shiny-conversation-react`
- **Converse_Controller**: The thermidor `buildConverseController` instance that manages conversation turns, streaming, and state
- **Turn**: A single user prompt submission and its associated agent response lifecycle (streaming → complete | error)
- **Agent_Message**: A text message streamed from the agent during a turn, composed of incremental deltas
- **Tool_Call**: An invocation made by the agent during processing, with a name, arguments, and an eventual result
- **A2UI_Surface**: An opaque UI surface payload streamed from the agent that represents structured visual content to render
- **Routed_Interface**: A sub-interface created when the converse endpoint routes to a commerce search or search use case
- **Product_Card**: A styled card component displaying a commerce product with name, price, brand, and image
- **Article_Card**: A styled card component displaying a search result article with title, excerpt, and source link
- **Turns_Menu**: The left sidebar navigation listing all conversation turns for browsing
- **Thinking_Block**: A collapsible UI section that groups tool call activity during agent processing
- **Loading_Skeleton**: An animated placeholder element shown while content is being streamed or loaded
- **CSS_Module**: A dedicated `.css` file imported by a component, containing all visual styles for that component

## Requirements

### Requirement 1: Project Structure and Separation of Concerns

**User Story:** As a developer reviewing the sample, I want each component to live in its own file with styles in separate CSS files, so that the code is easy to read and the architecture is clear.

#### Acceptance Criteria

1. THE Sample_App SHALL organize source code so that each component file exports exactly one React component and contains no other component definitions
2. THE Sample_App SHALL place all visual styles in dedicated CSS_Module files that are co-located with and named to match their corresponding component file (e.g., `ComponentName.module.css` for `ComponentName.tsx`)
3. THE Sample_App SHALL contain zero inline style objects (style={...}) and zero CSS-in-JS declarations within component files
4. THE Sample_App SHALL use the same build toolchain (Vite, React, TypeScript) and devDependency structure (vitest, playwright, @vitejs/plugin-react) as the existing `conversation-react` sample

### Requirement 2: Streaming Message Assembly

**User Story:** As a user watching the agent respond, I want streamed text deltas to assemble into a single flowing message, so that I see coherent text rather than fragmented pieces.

#### Acceptance Criteria

1. WHEN the Converse_Controller streams multiple Agent_Message entries for a single Turn, THE Sample_App SHALL concatenate all Agent_Message content values in arrival order and display the result as one continuous text block within a single container element
2. WHILE the Turn status is "streaming" and Agent_Message content is accumulating, THE Sample_App SHALL append each new Agent_Message content to the displayed text within 1 render cycle of receiving the state update, without replacing or re-rendering previously displayed text
3. WHEN the Turn status transitions to "complete", THE Sample_App SHALL retain the identical assembled text content and DOM structure that was displayed during streaming, producing no layout shift or content replacement on the transition
4. IF the Turn contains zero Agent_Message entries when status transitions to "complete", THEN THE Sample_App SHALL not render an empty message container in the conversation area

### Requirement 3: Collapsible Thinking Block for Tool Use

**User Story:** As a user, I want agent tool calls grouped into one collapsible "thinking" block, so that I can see the agent is working without cluttering the conversation.

#### Acceptance Criteria

1. WHEN one or more Tool_Call entries exist in the Turn agent response, THE Sample_App SHALL render all Tool_Call entries within a single collapsible Thinking_Block element that is collapsed by default
2. WHILE any Tool_Call has status "calling" and the Turn is streaming, THE Thinking_Block SHALL display a visible processing indicator that is visually distinct from the success indicator used for completed calls
3. WHEN all Tool_Call entries in a Turn have status "completed", THE Thinking_Block SHALL replace the processing indicator with the count of completed tool calls and a success indicator
4. WHEN the user expands the Thinking_Block, THE Sample_App SHALL reveal the tool name and arguments for each Tool_Call, and additionally the result for each Tool_Call that has status "completed"
5. WHEN a Tool_Call has status "calling" and the user expands the Thinking_Block, THE Sample_App SHALL display the tool name and accumulated arguments for that call and omit the result area

### Requirement 4: AGUI Surface Rendering with Loading Skeletons

**User Story:** As a user, I want AGUI surfaces to appear quickly with skeleton placeholders during loading, so that the interface feels responsive.

#### Acceptance Criteria

1. WHILE the Turn status is "streaming" and one or more A2UI_Surface entries exist in the Turn's agentResponse.surfaces array, THE Sample_App SHALL render one Loading_Skeleton placeholder per surface entry in the conversation area
2. WHEN the Turn status transitions to "complete", THE Sample_App SHALL replace each Loading_Skeleton with the rendered surface content by displaying the A2UI_Surface data as a structured visual block (e.g., key-value pairs or card layout derived from the opaque surface object)
3. THE Loading_Skeleton SHALL use a CSS animation (such as a pulse or shimmer effect) that is visually distinct from static content, indicating that content is loading
4. IF an A2UI_Surface entry is appended to the surfaces array while the Turn status is "streaming", THEN THE Sample_App SHALL render an additional Loading_Skeleton for that entry without removing or re-rendering existing skeletons or already-rendered surfaces

### Requirement 5: User Prompt Display

**User Story:** As a user, I want my submitted prompts displayed in the conversation thread, so that I can see the full context of what I asked.

#### Acceptance Criteria

1. WHEN the user submits a prompt via the Converse_Controller, THE Sample_App SHALL display the prompt text in the conversation area as a user message before the agent response for that Turn begins rendering
2. THE Sample_App SHALL visually distinguish user prompts from agent responses such that at least one of the following differs between prompt elements and response elements: horizontal alignment, background color, or container shape
3. THE Sample_App SHALL display the full prompt text in the conversation area without truncation, regardless of prompt length
4. WHEN multiple Turns exist, THE Sample_App SHALL display each Turn's user prompt above its corresponding agent response in chronological submission order

### Requirement 6: Commerce Product Card Rendering

**User Story:** As a user viewing commerce search results, I want products displayed as visually appealing cards, so that I can quickly scan and compare items.

#### Acceptance Criteria

1. WHEN a Routed_Interface with use case "commerceSearch" is present in the active Turn and the product list contains one or more products, THE Sample_App SHALL render each product as a Product_Card identified by the product's `permanentid`
2. IF the product has an `ec_price` value, THEN THE Product_Card SHALL display the price formatted as a currency amount with two decimal places. IF the product has an `ec_brand` value, THEN THE Product_Card SHALL display the brand. THE Product_Card SHALL always display the product `ec_name`.
3. THE Sample_App SHALL arrange Product_Card elements in a multi-column grid layout that adjusts the number of columns based on the available container width
4. WHEN the Pagination_Controller state `totalPages` is greater than 1, THE Sample_App SHALL render page navigation controls below the product grid that allow the user to move to the next and previous pages
5. WHEN a Routed_Interface with use case "commerceSearch" is present in the active Turn and the product list is empty, THE Sample_App SHALL display a message indicating that no products were found

### Requirement 7: Search Article Card Rendering

**User Story:** As a user viewing search results, I want articles displayed as styled cards, so that I can easily browse titles, summaries, and links.

#### Acceptance Criteria

1. WHEN a Routed_Interface with use case "search" is present in the active Turn and the result list contains one or more results, THE Sample_App SHALL render each result as an Article_Card displaying the result's title, excerpt, and clickUri as a hyperlink that opens in a new browser tab.
2. IF a result has no excerpt, THEN THE Article_Card SHALL render the result with its title and source link only and omit the excerpt area.
3. THE Sample_App SHALL arrange Article_Card elements in a vertical stacked list where each card is visually separated from adjacent cards by spacing or a visible border.
4. THE Sample_App SHALL identify each Article_Card using the result's uniqueId.
5. WHEN the Pagination_Controller state totalPages is greater than 1, THE Sample_App SHALL render pagination controls below the article list containing a previous-page button, a next-page button, and a current page indicator showing the current page number and total pages.
6. WHILE the Pagination_Controller state page is 0, THE Sample_App SHALL disable the previous-page button; WHILE the page equals totalPages minus 1, THE Sample_App SHALL disable the next-page button.

### Requirement 8: Turns Browsing Menu

**User Story:** As a user or stakeholder demoing the app, I want a left sidebar listing all conversation turns, so that I can navigate between past interactions.

#### Acceptance Criteria

1. THE Sample_App SHALL display a Turns_Menu in the left sidebar listing all Turn entries from the Converse_Controller state in their original order, where each entry displays the Turn prompt text
2. WHEN the user clicks a Turn entry in the Turns_Menu, THE Sample_App SHALL invoke `selectTurn` on the Converse_Controller and display that Turn content in the main area
3. THE Turns_Menu SHALL visually distinguish the currently active Turn (matching `activeTurnId`) from inactive turns using a differentiated background or border style
4. THE Turns_Menu SHALL truncate Turn prompt text exceeding 40 characters by cutting at the 40th character and appending an ellipsis character so that all entries occupy a single line
5. IF the Converse_Controller state contains zero Turn entries, THEN THE Turns_Menu SHALL render as an empty sidebar with no turn list items

### Requirement 9: thermidor DX Demonstration

**User Story:** As a developer evaluating the thermidor library, I want the sample to clearly demonstrate the controller pattern, subscription model, and state management approach, so that I understand how to build with thermidor.

#### Acceptance Criteria

1. THE Sample_App SHALL use `buildConverseController` to manage all conversation state and actions
2. THE Sample_App SHALL use `buildProductListController` and `buildPaginationController` for commerce search result state
3. THE Sample_App SHALL use `buildResultListController` and `buildPaginationController` for search result state
4. THE Sample_App SHALL call `controller.subscribe()` to receive state updates and invoke the returned unsubscribe function on component cleanup for each controller-connected component (`ConverseController`, `ProductListController`, `ResultListController`, `PaginationController`)
5. THE Sample_App SHALL instantiate an `Engine` with a configuration object and a `navigatorContextProvider`, then pass the engine to `buildGenerativeInterface` before constructing any controllers
6. WHEN the `ConverseController` state contains a `routedInterface`, THE Sample_App SHALL pass that interface instance to a child component that builds its own controllers from it

### Requirement 10: Visual Polish and Responsive Layout

**User Story:** As a stakeholder viewing the demo, I want the application to look professional and polished, so that it creates confidence in the product.

#### Acceptance Criteria

1. THE Sample_App SHALL define a spacing scale and apply spacing values exclusively from that scale across all components, use no more than two font families, and set body text to a minimum size of 14px
2. THE Sample_App SHALL implement a two-panel layout with the Turns_Menu occupying a fixed width between 200px and 300px on the left and the main conversation area filling the remaining width on the right
3. THE Sample_App SHALL apply CSS transitions with a duration between 150ms and 300ms for Turn selection highlighting, message appearance, and Thinking_Block expand/collapse
4. WHILE the viewport width is between 1024px and 1920px, THE Sample_App SHALL render all text content without horizontal overflow, without requiring horizontal scrolling, and at a minimum font size of 14px
5. THE Sample_App SHALL use a single defined color palette where all color values reference shared CSS custom properties, ensuring no component introduces colors outside the palette
