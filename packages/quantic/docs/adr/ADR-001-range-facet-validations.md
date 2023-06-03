# Validating Inputs in Range Facets

<!-- There are two main reasons why an ADR is needed for a feature
     If the feature lasts more then one sprint
     Or if a non-obvious design choice was chosen during feature development. -->

## Admin

<!--  cSpell:disable -->

- **Author:** [Luc Bergeron](https://github.com/lbergeron)
- **Deciders:**

  - [Nathan Lafrance-Berger](https://github.com/nathanlb)
  - [Asma Elfaleh](https://github.com/aelfaleh)
  - [Lucille Vu](https://github.com/lvu285)
  - [Audrey Drolet](https://github.com/adroletCoveo)

<!--  cSpell:enable -->

- **Date:** 2021-11-15
- **JIRA:** SFINT-4263
- **User Story:** [Timeframe invalid range validation message remain visible after clicking away from the Apply button](https://coveord.atlassian.net/browse/SFINT-4263)

## Context and Problem Statement

When the end user enters a custom range in a range facet (e.g., Timeframe facet, Numeric facet, etc.) we want only the relevant validation messages to be displayed. The goal is to inform the user of the mistakes, without showing persistent error messages as much as possible.

## Decision Drivers

### Context

1. [HTML 5 datepicker](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date) supports the [Constraint API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) and displays validation errors as tooltips. Validations are meant to be always active. The component look and feel does not match [Lightning Design System](https://www.lightningdesignsystem.com/).
2. [Lightning Input](https://developer.salesforce.com/docs/component-library/bundle/lightning-input/example) supports the [Constraint API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) and include several built-in validations. Validations are meant to be always active. It supports the pattern validation and [Lightning Design System (SLDS)](https://www.lightningdesignsystem.com/) look and feel out of the box.

### Decisions

1. Which input component to use (HTML 5 or Lightning)?
2. Which validation errors should hide/remain visible when interacting with other components?
3. Which validations should be verified when clicking the Apply button vs when the field is modified?

## Considered Options

**Which input component to use (HTML 5 or Lightning)?**

1. HTML 5 datepicker - We could use the HTML 5 datepicker and apply the SLDS styling on the text input. The supported features are uneven between browsers and the calendar cannot be styled. Validation errors are not annoying because they appear as tooltips, so we would not need to tweak the validations. Diverges from the user experience enforced by SLDS.

2. Lightning datepicker - We can use the Lightning datepicker. The datepicker and calendar are both matching the SLDS look and feel. Since the validation messages are displayed in red, we would need to implement some custom logic to be able to hide validation messages when needed. The built-in validations (e.g., date pattern) cannot be overridden or disabled.

**Which validation errors should hide/remain visible when interacting with other components?**

1. Hide all validation errors - We could hide all validation errors when interacting with other components. Hiding validation messages can be counter-intuitive because the input fields might still contain invalid information. This option cannot be achieved when using the Lightning Input.

2. Keep all validation errors - We could keep all validation errors until the input fields are all valid. This can be annoying especially for fields marked as required since the custom range is an optional form. If the user empties the input fields, the validation errors should disappear. The end user might be forced to do extra steps (e.g., empty fields, click Apply) to get rid of the validation messages.

3. Hide the "required" field validations but keep other validations - Since the custom range form is optional, we could make the "required" validations disappear until the form is filled. If the form is filled with invalid information (e.g., invalid pattern, invalid range), the validation errors should remain visible even when the user interacts with other components.

**Which validations should be verified when clicking the Apply button vs when the field is modified?**

1. Validate on Apply only - We could validate the inputs when clicking Apply only. It gives the user the time to fully fill the form before showing the validation errors. Having to click Apply to make validation errors disappear can be annoying.

2. Validate on field change - We could validate the inputs as soon as fields are modified. Validation errors might become visible before the user has the chance to fill the form, which is annoying.

3. Wait for the form to be filled, then validate on change - We could wait until the form is filled and the user clicks Apply before showing validation errors. Once the form is filled, then fields are validated as they change. It gives a faster feedback to the user without requiring the user to click Apply too often.

## Decision Outcome

### Which input component to use (HTML 5 or Lightning)?

**Option 2 - Lightning datepicker**

One goal of the Quantic components is to match the SLDS user experience as much as possible. Using the Lightning Input is more coherent with the SLDS look and feel even if it involves more tweaking.

### Which validation errors should hide/remain visible when interacting with other components?

**Option 3 - Hide the "required" field validations but keep other validations**

Because the range is optional, the validation errors should completely disappear when the form is empty. But, all errors that are caused by invalid input should remain visible. This is the option that brings the most coherent user experience and does not disturb the user by showing irrelevant error messages (e.g., showing persistent required field errors after clearing the input fields).

### Which validations should be verified when clicking the Apply button vs when the field is modified?

**Option 3 - Wait for the form to be filled, then validate on change**

Waiting for the Apply button to be clicked allows the user to fill the form without disruptions. However, validating the inputs on change keeps the validation errors in sync with the user inputs and avoid irrelevant error messages (e.g., showing range validation error for a date that is not in the form anymore).

## Pros & Cons

### Pros

- Styling matches SLDS
- Quick feedback loop when filling range information
- Limited persistent validation errors

### Cons

- Diverges from HTML 5 and Lightning standards because some errors are hidden automatically while others remain visible
- More delicate to implement as it involves custom logic

## Common Pitfalls

- Requires exhaustive testing

## Next Steps & Timeline

none

## Related Links

none
