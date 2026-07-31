# Requirements Document

## Introduction

The Product Context Attachment feature allows users to attach products as contextual information to their prompts in the `demo-react` application. This enables the conversational backend to consider specific products when generating responses. The feature is available in both the Search Results and Conversation views (but NOT on the Landing Page), and uses a "targeting mode" interaction pattern where users click products in the UI to attach them to their next prompt. The Landing Page PromptInput renders without the ProductTargeting wrapper and has no attachment capability.

## Glossary

- **Product Context Attachment**: The mechanism by which a user selects one or more products from the UI and attaches them to their prompt as additional context for the backend.
- **Targeting Mode**: An interactive state where the page cursor changes to a crosshair and product elements become clickable for selection. Activated by clicking the attach button.
- **Attach Button**: A paperclip icon button in the toolbar below the prompt input that toggles targeting mode on/off.
- **Context Pill**: A small product thumbnail displayed in the toolbar area representing an attached product. Clickable to remove.
- **Toolbar**: The always-visible area below the prompt textarea that contains the attach button, context pills, hint text, and clear button.
- **ProductTargeting Component**: The compound component that wraps the PromptInput and provides the toolbar, targeting controls, and context pill management.
- **TargetingContext**: A React context that propagates targeting state to all nested A2UI product surfaces (carousels, comparison tables, bundle displays).
- **Floating Navigation Button**: A circular icon button with `position: fixed` used to navigate between search results and conversation views without occupying persistent layout space.

## Requirements

### Requirement 1: Toolbar and Attach Button

**User Story:** As a user, I want a persistent toolbar below the prompt input with an attach button, so that I can discover and activate product attachment at any time.

#### Acceptance Criteria

1. THE toolbar SHALL always be rendered below the prompt textarea, forming a visually connected compound box (shared side borders, no bottom radius on textarea, no top border on toolbar).
2. THE toolbar SHALL contain a paperclip icon button on the left side that toggles targeting mode.
3. WHEN targeting mode is inactive and no products are attached, THE toolbar SHALL display the text "Attach product context" in italic, muted color (paler than secondary text) next to the attach button as a discoverable hint.
4. WHEN targeting mode is active and no products are attached yet, THE toolbar SHALL display the text "Select products to attach" in italic, muted color (paler than secondary text) next to the attach button.
5. THE attach button SHALL be visually highlighted (blue background/border) when targeting mode is active, using the same paperclip icon with a slightly bolder stroke weight.
6. THE attach button SHALL be disabled (greyed out, non-interactive) while the ConverseController is streaming.
7. THE toolbar SHALL have a consistent minimum height (42px) to prevent layout shift when content changes between hint text, pills, or empty state.
8. A thin vertical separator line SHALL visually separate the attach button from the hint text / context pills area.
9. THE attach button SHALL be the next tabbable element after the textarea WHEN the textarea is empty (clear and submit buttons are removed from tab order when empty).

### Requirement 2: Product Selection via Targeting Mode

**User Story:** As a user, I want to click products in the page to attach them as context, so that I can reference specific products in my prompt.

#### Acceptance Criteria

1. WHEN targeting mode is active, THE page cursor SHALL change to a crosshair cursor across the entire page content area.
2. WHEN targeting mode is active, ALL product elements (ProductCards in search grid, A2UIProductCards in carousels, product header cells in comparison tables, item rows in bundle displays) SHALL become clickable with a blue box-shadow highlight on hover.
3. WHEN the user clicks a product in targeting mode, THE product SHALL be added to the attached context (appearing as a thumbnail pill in the toolbar) and remain highlighted in the product list with a persistent blue ring and reduced opacity.
4. WHEN the user clicks an already-selected product in targeting mode, THE product SHALL be removed from the attached context (toggle behavior).
5. Targeting mode SHALL remain active after selecting a product, allowing multiple products to be selected without re-activating the mode.
6. THE user SHALL be able to exit targeting mode by: clicking the attach button again, pressing the Escape key, clicking the "Done" button in the toolbar, or when a prompt is submitted.
7. WHILE targeting mode is active, ALL non-product interactive elements (sidebar, pagination, sort controls) SHALL be visually muted (reduced opacity) and non-interactive (pointer-events disabled).
8. Targeting mode SHALL be automatically exited when streaming begins.
9. WHEN targeting mode is active, A "Done" button SHALL appear right-aligned in the toolbar to provide an explicit way to complete product selection.

### Requirement 3: Context Pills Display

**User Story:** As a user, I want to see which products I've attached as thumbnails below the input, so that I can review and manage my context before submitting.

#### Acceptance Criteria

1. WHEN products are attached, THE toolbar SHALL display small thumbnail images (28x28px) for each attached product, positioned to the right of the vertical separator.
2. IF a product has no thumbnail image available, THE pill SHALL render a grey placeholder square of the same dimensions.
3. WHEN the user hovers over a context pill, THE thumbnail SHALL fade slightly and a small x badge SHALL appear at the top-right corner of the pill as a gray circle (not red).
4. WHEN the user clicks a context pill (outside of streaming), THE corresponding product SHALL be removed from the attached context.
5. Context pills SHALL be keyboard-accessible: focusable via Tab, removable via Enter or Space key.
6. EACH pill SHALL have a title tooltip showing the product name and "click to remove" instruction.
7. WHILE streaming is active, context pills SHALL NOT be removable (pointer-events disabled, not focusable).
8. THE toolbar SHALL have `overflow: visible` to allow pill badges to overflow without clipping.

### Requirement 4: Clear All Action

**User Story:** As a user, I want to clear all attached products at once, so that I can start fresh without removing them one by one.

#### Acceptance Criteria

1. WHEN products are attached AND targeting mode is NOT active, A "Clear" button SHALL appear right-aligned in the toolbar area.
2. THE "Clear" button SHALL be hidden while targeting mode is active (to avoid confusion during selection).
3. WHEN the user clicks "Clear", ALL attached products SHALL be removed from the context.
4. THE "Clear" button SHALL highlight blue on hover (matching the attach button style).
5. THE "Clear" button SHALL be disabled while streaming.

### Requirement 5: Prompt Submission with Context

**User Story:** As a user, I want my attached products to be included when I submit a prompt, so that the backend can use them for a better response.

#### Acceptance Criteria

1. WHEN the user submits a prompt with attached products, THE submitted prompt text SHALL be: `<user text> [ADDITIONAL CONTEXT: <product_name_1>, <product_name_2>, ...]` where product names are the `ec_name` field values joined by commas.
2. WHEN the user submits a prompt without attached products, THE prompt SHALL be submitted as-is without any suffix.
3. AFTER submission, targeting mode SHALL be exited.
4. AFTER submission, THE attached products SHALL remain visible in the toolbar (not cleared), allowing the user to reuse the same context for follow-up prompts.
5. THE `[ADDITIONAL CONTEXT: ...]` annotation SHALL NOT be visible in the textarea — it is only appended at submit time.
6. A product that is already present in the attached list SHALL NOT be added again when clicked in targeting mode (duplicate prevention).

### Requirement 6: Context Persistence Across Views

**User Story:** As a user, I want my attached products to persist when switching between search and conversation views, so that I don't lose my context selections.

#### Acceptance Criteria

1. THE attached products state SHALL be managed at the AppShell level and passed to both SearchResultsPage and ConversationPage.
2. WHEN navigating from search to conversation (or vice versa), THE attached products SHALL be preserved.
3. WHEN navigating between search and conversation views via the floating navigation buttons, THE prompt text SHALL be cleared but attached products SHALL remain.

### Requirement 7: Context Display in Conversation History

**User Story:** As a user, I want to see which products were attached to my previous prompts in the conversation thread, so that I can understand the context of past turns.

#### Acceptance Criteria

1. WHEN a user prompt bubble in the conversation thread contains the `[ADDITIONAL CONTEXT: ...]` suffix, THE bubble SHALL render the user's text without the suffix, followed by a horizontal separator and a "Products:" section listing the product names as a bulleted list.
2. THE raw `[ADDITIONAL CONTEXT: ...]` text SHALL NOT be displayed to the user in the conversation thread.
3. THE product list in the bubble SHALL use a smaller font size and secondary text color to visually distinguish it from the prompt text.

### Requirement 8: View Navigation

**User Story:** As a user, I want to quickly navigate between search results and conversation views without the navigation taking up persistent layout space.

#### Acceptance Criteria

1. IN search results mode, A floating circular icon button with a speech bubble icon SHALL be fixed at the bottom-right of the viewport (24px margins) to navigate back to conversation.
2. IN conversation mode, A floating circular icon button with a list icon SHALL be fixed at the top-right of the viewport (24px margins) to navigate back to search results.
3. THE floating buttons SHALL be semi-transparent (opacity ~0.7) by default and become fully opaque on hover.
4. THE floating buttons SHALL have a subtle box-shadow for visibility against content.
5. THE floating buttons SHALL have `title` tooltips ("Back to conversation" / "Back to search results").
6. IN conversation mode, THE floating back-to-search button SHALL only be visible when there are search results to return to (`canGoBackToSearch` is true).
7. THE conversation page SHALL NOT have a top navigation bar — the full viewport height is used for the conversation thread and prompt.
