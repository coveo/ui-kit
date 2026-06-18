# Implementation Plan: shiny-conversation-react

## Overview

Build a polished React sample application at `samples/headless-future/shiny-conversation-react` that demonstrates headless-future DX patterns in a conversational UI. The implementation reuses the controller-based architecture from the existing `conversation-react` sample but replaces all inline styles with CSS modules, adds streaming assembly, collapsible thinking blocks, AGUI surface rendering with loading skeletons, product/article cards, and a turns navigation menu.

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Scaffold the project directory and configuration files
    - Create `samples/headless-future/shiny-conversation-react/` directory
    - Create `package.json` mirroring `conversation-react` dependencies (add `fast-check` as devDependency for property tests)
    - Create `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts` from existing sample
    - Create `.env.example`, `.env.e2e`, `.gitignore`, `index.html`
    - _Requirements: 1.4, 9.5_

  - [x] 1.2 Create CSS design tokens and global styles
    - Create `src/index.css` with all CSS custom properties from the design (spacing scale, color palette, typography, layout, transitions, radius)
    - Define `:root` variables for `--space-*`, `--color-*`, `--font-*`, `--sidebar-width`, `--transition-*`, `--radius-*`
    - Set body font to Inter/system-ui at 14px minimum, apply two-font-family constraint (sans + mono)
    - _Requirements: 10.1, 10.5_

  - [x] 1.3 Create entry point and App shell
    - Create `src/index.tsx` rendering `<App />` into root
    - Create `src/App.tsx` with root layout shell (two-panel flex layout)
    - Create `src/App.module.css` with two-panel layout styles (sidebar fixed 260px, main fills remaining)
    - _Requirements: 1.1, 1.2, 1.3, 10.2_

  - [x] 1.4 Create generative setup module
    - Create `src/generative-setup.ts` with Engine instantiation, `buildGenerativeInterface`, and `buildConverseController` export
    - Create `src/env.ts` for environment variable parsing with clear error on missing variables
    - _Requirements: 9.1, 9.5_

- [x] 2. Implement utility functions
  - [x] 2.1 Create pure utility functions
    - Create `src/utils.ts` with `assembleMessages`, `truncateText`, and `formatPrice` functions
    - `assembleMessages`: concatenate all message `content` values in array order
    - `truncateText`: return original if length ≤ maxLength, else first maxLength chars + "…"
    - `formatPrice`: return `$X.YY` string with exactly 2 decimal places
    - _Requirements: 2.1, 6.2, 8.4_

  - [x]\* 2.2 Write property test for message assembly
    - **Property 1: Message assembly preserves content and order**
    - **Validates: Requirements 2.1**

  - [x]\* 2.3 Write property test for price formatting
    - **Property 4: Product card price formatting**
    - **Validates: Requirements 6.2**

  - [x]\* 2.4 Write property test for text truncation
    - **Property 6: Turns menu text truncation**
    - **Validates: Requirements 8.4**

- [x] 3. Implement core conversation components
  - [x] 3.1 Implement ConversePage orchestrator
    - Create `src/ConversePage.tsx` subscribing to `converseController`, managing `activeTurn` and `isStreaming`
    - Create `src/ConversePage.module.css` with layout styles for the conversation page area
    - Wire `TurnsMenu` in sidebar and `ConversationArea` in main content
    - _Requirements: 9.1, 9.4, 10.2_

  - [x] 3.2 Implement PromptInput component
    - Create `src/PromptInput.tsx` with text input, Enter to submit, disabled state during streaming
    - Create `src/PromptInput.module.css` with styled input field
    - _Requirements: 5.1, 9.1_

  - [x] 3.3 Implement ConversationArea component
    - Create `src/ConversationArea.tsx` rendering the active turn content (UserPrompt + AgentResponse)
    - Create `src/ConversationArea.module.css` with conversation layout and turn ordering
    - _Requirements: 5.4_

  - [x] 3.4 Implement UserPrompt component
    - Create `src/UserPrompt.tsx` displaying user prompt text with distinct visual styling (alignment, background, shape)
    - Create `src/UserPrompt.module.css` with user bubble styles (--color-bg-user-prompt)
    - _Requirements: 5.1, 5.2, 5.3_

  - [x]\* 3.5 Write property test for user prompt display
    - **Property 3: User prompt text displayed without truncation**
    - **Validates: Requirements 5.3**

- [x] 4. Implement agent response components
  - [x] 4.1 Implement AgentResponse component
    - Create `src/AgentResponse.tsx` rendering StreamingMessage, ThinkingBlock, and SurfaceRenderer based on turn status
    - Create `src/AgentResponse.module.css` with agent response container styles
    - Handle zero messages case (don't render empty container)
    - _Requirements: 2.4, 5.2_

  - [x] 4.2 Implement StreamingMessage component
    - Create `src/StreamingMessage.tsx` using `assembleMessages` utility to render concatenated text
    - Create `src/StreamingMessage.module.css` with message text styles (pre-wrap, transitions)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.3 Implement ThinkingBlock component
    - Create `src/ThinkingBlock.tsx` with collapsible details element, collapsed by default
    - Show processing indicator while any tool call has status "calling"
    - Show success indicator + count when all complete
    - On expand: show tool name, args, and result (if completed)
    - Create `src/ThinkingBlock.module.css` with collapse/expand transition styles
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.3_

  - [x] 4.4 Implement SurfaceRenderer and LoadingSkeleton components
    - Create `src/SurfaceRenderer.tsx` rendering skeletons during streaming, content on complete
    - Create `src/LoadingSkeleton.tsx` with animated pulse/shimmer placeholder
    - Create `src/SurfaceRenderer.module.css` and `src/LoadingSkeleton.module.css`
    - Render one skeleton per surface entry; replace with key-value card on complete
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x]\* 4.5 Write property test for skeleton count
    - **Property 2: Skeleton count equals surface count during streaming**
    - **Validates: Requirements 4.1**

- [x] 5. Checkpoint - Ensure core conversation renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement turns menu
  - [x] 6.1 Implement TurnsMenu component
    - Create `src/TurnsMenu.tsx` listing turns in sidebar, using `truncateText` for prompt display
    - Highlight active turn with differentiated background (--color-bg-active)
    - Handle click to invoke `selectTurn` on controller
    - Render empty sidebar when zero turns
    - Create `src/TurnsMenu.module.css` with sidebar list, active state, and transition styles
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.4, 10.3_

- [x] 7. Implement routed interface components
  - [x] 7.1 Implement ProductCard component
    - Create `src/ProductCard.tsx` displaying ec_name, conditional ec_brand, conditional ec_price (via `formatPrice`)
    - Display product image from ec_thumbnails/ec_images if available
    - Create `src/ProductCard.module.css` with card styles
    - _Requirements: 6.1, 6.2_

  - [x] 7.2 Implement ArticleCard component
    - Create `src/ArticleCard.tsx` displaying title, optional excerpt, clickUri as link with `target="_blank"`
    - Create `src/ArticleCard.module.css` with card styles and spacing
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 7.3 Implement Pagination component
    - Create `src/Pagination.tsx` with previous/next buttons and page indicator
    - Disable previous when page === 0, disable next when page === totalPages - 1
    - Create `src/Pagination.module.css` with button and indicator styles
    - _Requirements: 6.4, 7.5, 7.6_

  - [x]\* 7.4 Write property test for pagination disabled states
    - **Property 5: Pagination button disabled states**
    - **Validates: Requirements 7.6**

  - [x] 7.5 Implement RoutedCommerceResults component
    - Create `src/RoutedCommerceResults.tsx` building `ProductListController` + `PaginationController` from routed interface
    - Render product grid with responsive multi-column layout, pagination, and empty state
    - Create `src/RoutedCommerceResults.module.css` with grid layout styles
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 9.2, 9.4, 9.6_

  - [x] 7.6 Implement RoutedSearchResults component
    - Create `src/RoutedSearchResults.tsx` building `ResultListController` + `PaginationController` from routed interface
    - Render vertical article list with pagination and empty state
    - Create `src/RoutedSearchResults.module.css` with list layout styles
    - _Requirements: 7.1, 7.3, 7.5, 7.6, 9.3, 9.4, 9.6_

- [x] 8. Checkpoint - Ensure all components render and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Wire everything together and final integration
  - [x] 9.1 Connect ConversePage to all child components
    - Wire ConversePage to pass turn data to ConversationArea, TurnsMenu, and PromptInput
    - Handle routing: render RoutedCommerceResults or RoutedSearchResults based on routedInterface.useCase
    - Handle error turns with error message display and retry button
    - _Requirements: 5.4, 9.1, 9.6_

  - [x] 9.2 Apply responsive layout and visual polish
    - Ensure two-panel layout works between 1024px–1920px without horizontal overflow
    - Verify all colors reference CSS custom properties only
    - Verify all transitions are 150ms–300ms
    - Verify minimum 14px font size on body text
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

  - [x]\* 9.3 Write unit tests for key component behaviors
    - Test ThinkingBlock collapse/expand behavior
    - Test TurnsMenu active highlighting and click handler
    - Test StreamingMessage assembly rendering
    - Test ProductCard conditional rendering (with/without price/brand)
    - Test ArticleCard link target and missing excerpt
    - _Requirements: 3.1, 3.4, 6.2, 7.1, 7.2, 8.2, 8.3_

- [x] 10. Final checkpoint - Full validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation language is TypeScript with React (matching the existing conversation-react sample)
- All CSS must use CSS modules (`.module.css`) — zero inline styles allowed
- The sample is a read-only consumer of headless-future controllers; no library code is modified

## Task Dependency Graph

```json
{
  "waves": [
    {"id": 0, "tasks": ["1.1", "1.2"]},
    {"id": 1, "tasks": ["1.3", "1.4"]},
    {"id": 2, "tasks": ["2.1", "3.1", "3.2"]},
    {"id": 3, "tasks": ["2.2", "2.3", "2.4", "3.3", "3.4"]},
    {"id": 4, "tasks": ["3.5", "4.1", "6.1"]},
    {"id": 5, "tasks": ["4.2", "4.3", "4.4"]},
    {"id": 6, "tasks": ["4.5", "7.1", "7.2", "7.3"]},
    {"id": 7, "tasks": ["7.4", "7.5", "7.6"]},
    {"id": 8, "tasks": ["9.1"]},
    {"id": 9, "tasks": ["9.2", "9.3"]}
  ]
}
```
