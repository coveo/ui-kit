---
'@coveo/quantic': major
---

Quantic no longer ships 12 custom labels that no component used: `quantic_Previous`, `quantic_Next`, `quantic_Irrelevant`, `quantic_Inaccurate`, `quantic_OutOfDate`, `quantic_Harmful`, `quantic_Feedback`, `quantic_WhyGeneratedAnswerWasNotHelpful`, `quantic_ThisAnswerWasHelpful`, `quantic_ThisAnswerWasNotHelpful`, `quantic_ShowingResultsOf_zero` and `quantic_ShowingResultsOfWithQuery_zero`. Their French and Spanish translations are removed too. If your own components import one of them, define your own custom label instead. The `quantic_InvalidNumberOfAutoOpenedDocuments` error message now reads "greater than 0" instead of "greater that 0".
