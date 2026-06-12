# Coveo Accessibility Conformance Report

International Edition

(Based on VPAT® Version 2.5Rev)

**Name of Product/Version:** Coveo Atomic 3.59.5

**Report Date:** 2026-06-12

**Product Description:** Coveo Atomic is a web component library for building search and commerce interfaces.

**Contact Information:** support@coveo.com

**Notes:** Generated from a11y/reports/a11y-report.json. Conformance is derived from axe-core results, interactive keyboard tests, and manual audits. Rows marked [Manual audit required] have no automated or interactive coverage and are reported as Does Not Support pending manual verification.

**Evaluation Methods Used:** axe-core 4.11.4; Storybook addon-a11y; Storybook interactive play() tests; Manual audit

## Applicable Standards/Guidelines

This report covers the degree of conformance for the following accessibility standard/guidelines:

| Standard/Guideline                                                                                                                                                                               | Included In Report                            | Notes                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------- |
| Web Content Accessibility Guidelines 2.2                                                                                                                                                         | Level A (Yes), Level AA (Yes), Level AAA (No) |                              |
| Revised Section 508 standards published January 18, 2017 and corrected January 22, 2018                                                                                                          |                                               |                              |
| EN 301 549 Accessibility requirements for ICT products and services - V3.2.1 (2021-03)                                                                                                           |                                               |                              |
| [Revised Section 508 standards (36 CFR 1194)](https://www.access-board.gov/guidelines-and-standards/communications-and-it/about-the-ict-refresh/final-rule/text-of-the-standards-and-guidelines) | Yes                                           | See Section 508 tables below |
| [EN 301 549 v3.2.1 (2021-03)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf)                                                                       | Yes                                           | See EN 301 549 tables below  |

## Terms

The terms used in the Conformance Level information are defined as follows:

- **Supports:** The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation.
- **Partially Supports:** Some functionality of the product does not meet the criterion.
- **Does Not Support:** The majority of product functionality does not meet the criterion.
- **Not Applicable:** The criterion is not relevant to the product.
- **Not Evaluated:** The product has not been evaluated against the criterion. This can only be used in WCAG Level AAA criteria.

## WCAG 2.x Report

Note: When reporting on conformance with the WCAG 2.x Success Criteria, they are scoped for full pages, complete processes, and programming units, respectively.

### Table 1: Success Criteria, Level A

Notes: Conformance is based on automated Storybook + axe-core output and interactive keyboard testing.

| Criteria                                                   | Conformance Level | Remarks and Explanations                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1 Non-text Content                                     | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                                                         |
| 1.2.1 Audio-only and Video-only (Prerecorded)              | Not Applicable    | Atomic does not include audio-only or video-only media components.                                                                                                                                                                                                                 |
| 1.2.2 Captions (Prerecorded)                               | Not Applicable    | Atomic does not include synchronized media components requiring captions.                                                                                                                                                                                                          |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | Not Applicable    | Atomic does not include synchronized media components requiring audio descriptions.                                                                                                                                                                                                |
| 1.3.1 Info and Relationships                               | Supports          | Supports — automated axe-core found no violations across 169 component(s); interactive keyboard testing passed across 2 component(s).                                                                                                                                              |
| 1.3.2 Meaningful Sequence                                  | Does Not Support  | WCAG 1.3.2: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 1.3.3 Sensory Characteristics                              | Does Not Support  | WCAG 1.3.3: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 1.4.1 Use of Color                                         | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                                                         |
| 1.4.2 Audio Control                                        | Not Applicable    | Atomic does not include components that auto-play audio.                                                                                                                                                                                                                           |
| 2.1.1 Keyboard                                             | Supports          | Supports — automated axe-core found no violations across 171 component(s); interactive keyboard testing passed across 31 component(s).                                                                                                                                             |
| 2.1.2 No Keyboard Trap                                     | Supports          | Supports — automated axe-core found no violations across 9 component(s); interactive keyboard testing passed across 9 component(s).                                                                                                                                                |
| 2.1.4 Character Key Shortcuts                              | Does Not Support  | WCAG 2.1.4: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 2.2.1 Timing Adjustable                                    | Not Applicable    | No Atomic component enforces time limits on user interaction.                                                                                                                                                                                                                      |
| 2.2.2 Pause, Stop, Hide                                    | Not Applicable    | Atomic does not include moving, blinking, scrolling, or auto-updating content that starts automatically and lasts more than five seconds.                                                                                                                                          |
| 2.3.1 Three Flashes or Below Threshold                     | Not Applicable    | Atomic does not include content that flashes more than three times per second.                                                                                                                                                                                                     |
| 2.4.1 Bypass Blocks                                        | Does Not Support  | WCAG 2.4.1: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 2.4.2 Page Titled                                          | Not Applicable    | Page titles are a host application concern, not a component library concern.                                                                                                                                                                                                       |
| 2.4.3 Focus Order                                          | Does Not Support  | WCAG 2.4.3: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 2.4.4 Link Purpose (In Context)                            | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                                                         |
| 2.5.1 Pointer Gestures                                     | Not Applicable    | Atomic does not implement multipoint or path-based gestures. Carousels use button-based navigation, scrollable containers use native browser scroll with arrow buttons, and touch events (touchstart/touchend) are used only as single-point tap equivalents for analytics timing. |
| 2.5.2 Pointer Cancellation                                 | Does Not Support  | WCAG 2.5.2: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 2.5.3 Label in Name                                        | Does Not Support  | WCAG 2.5.3: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 2.5.4 Motion Actuation                                     | Not Applicable    | Atomic does not include functionality operated by device or user motion.                                                                                                                                                                                                           |
| 3.1.1 Language of Page                                     | Not Applicable    | The lang attribute on the HTML element is a host application concern, not a component library concern.                                                                                                                                                                             |
| 3.2.1 On Focus                                             | Does Not Support  | WCAG 3.2.1: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 3.2.2 On Input                                             | Does Not Support  | WCAG 3.2.2: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 3.2.6 Consistent Help                                      | Not Applicable    | Consistent help placement across pages is a host application concern; Atomic components do not control page-level layout or ordering of help mechanisms.                                                                                                                           |
| 3.3.1 Error Identification                                 | Does Not Support  | WCAG 3.3.1: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                                                                 |
| 3.3.2 Labels or Instructions                               | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                                                         |
| 3.3.7 Redundant Entry                                      | Not Applicable    | Atomic does not include multi-step forms that require redundant data entry.                                                                                                                                                                                                        |
| 4.1.2 Name, Role, Value                                    | Supports          | Supports — automated axe-core found no violations across 169 component(s); interactive keyboard testing passed across 4 component(s).                                                                                                                                              |

### Table 2: Success Criteria, Level AA

Notes: Conformance is based on automated Storybook + axe-core output and interactive keyboard testing.

| Criteria                                        | Conformance Level | Remarks and Explanations                                                                                                                                                                                                                      |
| ----------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.2.4 Captions (Live)                           | Not Applicable    | Atomic does not include live audio content.                                                                                                                                                                                                   |
| 1.2.5 Audio Description (Prerecorded)           | Not Applicable    | Atomic does not include prerecorded video content requiring audio descriptions.                                                                                                                                                               |
| 1.3.4 Orientation                               | Not Applicable    | Atomic does not restrict display orientation. No component uses the Screen Orientation API, @media orientation queries, or CSS transforms that lock the page to portrait or landscape.                                                        |
| 1.3.5 Identify Input Purpose                    | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                    |
| 1.4.3 Contrast (Minimum)                        | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                    |
| 1.4.4 Resize text                               | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                    |
| 1.4.5 Images of Text                            | Not Applicable    | Atomic does not render text as images. All text is real HTML styled with CSS. SVG icons are purely symbolic (no `<text>` elements). Product/result images display user-provided content, not component-generated text.                        |
| 1.4.10 Reflow                                   | Does Not Support  | WCAG 1.4.10: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                           |
| 1.4.11 Non-text Contrast                        | Does Not Support  | WCAG 1.4.11: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                           |
| 1.4.12 Text Spacing                             | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                    |
| 1.4.13 Content on Hover or Focus                | Supports          | Supports — automated axe-core found no violations across 1 component(s); interactive keyboard testing passed across 1 component(s).                                                                                                           |
| 2.4.5 Multiple Ways                             | Not Applicable    | Multiple navigation ways are a host application concern, not a component library concern.                                                                                                                                                     |
| 2.4.6 Headings and Labels                       | Does Not Support  | WCAG 2.4.6: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                            |
| 2.4.7 Focus Visible                             | Supports          | Focus indicators provided by design system (Tailwind focus-visible:ring-\* utilities). All instances of outline:none are paired with :focus-visible alternatives.                                                                             |
| 2.4.11 Focus Not Obscured (Minimum)             | Does Not Support  | WCAG 2.4.11: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                           |
| 2.5.7 Dragging Movements                        | Not Applicable    | No Atomic component implements custom dragging movements. Scrollable containers use native CSS overflow (user-agent scrolling, exempt per 2.5.7) with arrow button alternatives. Modal touchmove listeners only prevent background scrolling. |
| 2.5.8 Target Size (Minimum)                     | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                    |
| 3.1.2 Language of Parts                         | Supports          | Supports — automated axe-core found no violations across 169 component(s).                                                                                                                                                                    |
| 3.2.3 Consistent Navigation                     | Not Applicable    | Consistent navigation ordering is a host application concern; Atomic components do not control page-level navigation.                                                                                                                         |
| 3.2.4 Consistent Identification                 | Not Applicable    | Consistent identification across pages is a host application concern; individual Atomic components use consistent internal naming.                                                                                                            |
| 3.3.3 Error Suggestion                          | Does Not Support  | WCAG 3.3.3: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                            |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Does Not Support  | WCAG 3.3.4: no automated, interactive, or manual coverage. [Manual audit required]                                                                                                                                                            |
| 3.3.8 Accessible Authentication (Minimum)       | Not Applicable    | Atomic does not include authentication flows.                                                                                                                                                                                                 |
| 4.1.3 Status Messages                           | Supports          | Supports — automated axe-core found no violations across 18 component(s); interactive keyboard testing passed across 18 component(s).                                                                                                         |

## Revised Section 508 Report

### Chapter 3: Functional Performance Criteria

| Criteria                                                       | Conformance Level         | Remarks and Explanations                                                              |
| -------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| 302.1 Without Vision                                           | See WCAG 2.x tables above | Covered by WCAG criteria for text alternatives, structure, and screen reader support. |
| 302.2 With Limited Vision                                      | See WCAG 2.x tables above | Covered by WCAG criteria for contrast, resize, reflow, and spacing.                   |
| 302.3 Without Perception of Color                              | See WCAG 2.x tables above | Covered by WCAG 1.4.1 Use of Color.                                                   |
| 302.4 Without Hearing                                          | Not Applicable            | Coveo Atomic does not produce audio output.                                           |
| 302.5 With Limited Hearing                                     | Not Applicable            | Coveo Atomic does not produce audio output.                                           |
| 302.6 Without Speech                                           | Not Applicable            | Coveo Atomic does not require speech input.                                           |
| 302.7 With Limited Manipulation                                | See WCAG 2.x tables above | Covered by WCAG criteria for keyboard access and pointer input.                       |
| 302.8 With Limited Reach and Strength                          | Not Applicable            | Coveo Atomic is not hardware and does not require physical reach.                     |
| 302.9 With Limited Language, Cognitive, and Learning Abilities | See WCAG 2.x tables above | Covered by WCAG criteria for labels, error handling, and consistent navigation.       |

### Chapter 4: Hardware

| Criteria                        | Conformance Level | Remarks and Explanations                                     |
| ------------------------------- | ----------------- | ------------------------------------------------------------ |
| 402–415 (all hardware criteria) | Not Applicable    | Coveo Atomic is a web component library; it is not hardware. |

### Chapter 5: Software

| Criteria                                       | Conformance Level         | Remarks and Explanations                                                                                       |
| ---------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 501.1 Scope                                    | See WCAG 2.x tables above | Coveo Atomic renders in a web browser; web content criteria apply.                                             |
| 502 Interoperability with Assistive Technology | See WCAG 2.x tables above | Accessibility semantics exposed via standard HTML and ARIA; see WCAG 4.1.2.                                    |
| 503 Applications                               | See WCAG 2.x tables above | User preferences for color, contrast, font size, and focus are supported via standard browser and OS settings. |
| 504 Authoring Tools                            | Not Applicable            | Coveo Atomic is not an authoring tool; it does not enable users to create or edit web content for publication. |

### Chapter 6: Support Documentation and Services

| Criteria                                                         | Conformance Level | Remarks and Explanations                                                                                                                                  |
| ---------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 602.2 Accessibility and Compatibility Features                   | Not Applicable    | Coveo Atomic is a component library; end-user support documentation is the host application's responsibility. Developer docs available at docs.coveo.com. |
| 602.3 Electronic Support Documentation                           | Not Applicable    | See above.                                                                                                                                                |
| 602.4 Alternate Formats for Non-Electronic Support Documentation | Not Applicable    | Coveo does not provide print support documentation for Coveo Atomic.                                                                                      |
| 603.2 Information on Accessibility and Compatibility Features    | Not Applicable    | See above.                                                                                                                                                |
| 603.3 Accommodation of Communication Needs                       | Not Applicable    | Support is provided via web and email; accessible formats available on request.                                                                           |

## EN 301 549 Report

### Chapter 4: Functional Performance Statements

| Criteria                                                  | Conformance Level         | Remarks and Explanations                                                              |
| --------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| 4.2.1 Usage without vision                                | See WCAG 2.x tables above | Covered by WCAG criteria for text alternatives, structure, and screen reader support. |
| 4.2.2 Usage with limited vision                           | See WCAG 2.x tables above | Covered by WCAG criteria for contrast, resize, reflow, and spacing.                   |
| 4.2.3 Usage without perception of colour                  | See WCAG 2.x tables above | Covered by WCAG 1.4.1 Use of Color.                                                   |
| 4.2.4 Usage without hearing                               | Not Applicable            | Coveo Atomic does not produce audio output.                                           |
| 4.2.5 Usage with limited hearing                          | Not Applicable            | Coveo Atomic does not produce audio output.                                           |
| 4.2.6 Usage with no or limited vocal capability           | Not Applicable            | Coveo Atomic does not require speech input.                                           |
| 4.2.7 Usage with limited manipulation or strength         | See WCAG 2.x tables above | Covered by WCAG criteria for keyboard access and pointer input.                       |
| 4.2.8 Usage with limited reach                            | Not Applicable            | Coveo Atomic is not hardware.                                                         |
| 4.2.9 Minimize photosensitive seizure triggers            | See WCAG 2.x tables above | See WCAG 2.3.1 Three Flashes or Below Threshold.                                      |
| 4.2.10 Usage with limited cognition, language or learning | See WCAG 2.x tables above | Covered by WCAG criteria for labels, error handling, and consistent navigation.       |
| 4.2.11 Privacy                                            | Not Applicable            | Coveo Atomic does not collect or process personal data independently.                 |

### Chapter 5: Generic Requirements

| Criteria      | Conformance Level | Remarks and Explanations                                                                                                          |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 5.2–5.9 (all) | Not Applicable    | Coveo Atomic runs in standard web browsers that provide platform accessibility services. It is not closed-functionality software. |

### Chapter 6: ICT with Two-Way Voice Communication

| Criteria      | Conformance Level | Remarks and Explanations                                   |
| ------------- | ----------------- | ---------------------------------------------------------- |
| 6.1–6.6 (all) | Not Applicable    | Coveo Atomic does not provide two-way voice communication. |

### Chapter 7: ICT with Video Capabilities

| Criteria      | Conformance Level | Remarks and Explanations                                 |
| ------------- | ----------------- | -------------------------------------------------------- |
| 7.1–7.3 (all) | Not Applicable    | Coveo Atomic does not include video playback or capture. |

### Chapter 8: Hardware

| Criteria      | Conformance Level | Remarks and Explanations      |
| ------------- | ----------------- | ----------------------------- |
| 8.1–8.5 (all) | Not Applicable    | Coveo Atomic is not hardware. |

### Chapter 9: Web

| Criteria                           | Conformance Level         | Remarks and Explanations                                                                          |
| ---------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| 9.1–9.4 (all web content criteria) | See WCAG 2.x tables above | EN 301 549 Chapter 9 maps to WCAG 2.1 Level A and AA. See WCAG 2.x tables above for full results. |

### Chapter 10: Non-Web Documents

| Criteria        | Conformance Level | Remarks and Explanations                         |
| --------------- | ----------------- | ------------------------------------------------ |
| 10.1–10.6 (all) | Not Applicable    | Coveo Atomic does not produce non-web documents. |

### Chapter 11: Software

| Criteria        | Conformance Level         | Remarks and Explanations                                                        |
| --------------- | ------------------------- | ------------------------------------------------------------------------------- |
| 11.1–11.8 (all) | See WCAG 2.x tables above | Coveo Atomic renders as web content in a user agent. See WCAG 2.x tables above. |

### Chapter 12: Documentation and Support Services

| Criteria                   | Conformance Level | Remarks and Explanations                                                          |
| -------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| 12.1 Product documentation | Not Applicable    | Developer documentation is available at docs.coveo.com in accessible HTML format. |
| 12.2 Support services      | Not Applicable    | Support is provided via web and email; accessible formats available on request.   |

### Chapter 13: ICT Providing Relay or Emergency Service Access

| Criteria        | Conformance Level | Remarks and Explanations                                   |
| --------------- | ----------------- | ---------------------------------------------------------- |
| 13.1–13.3 (all) | Not Applicable    | Coveo Atomic does not provide relay or emergency services. |

## Legal Disclaimer (Coveo)

This document is provided for informational purposes only and the contents hereof are subject to change without notice. Coveo does not warrant that this document is error free, nor does it provide any other warranties or conditions, whether expressed orally or implied in law, including implied warranties and conditions of merchantability or fitness for a particular purpose.
