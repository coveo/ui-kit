---
title: Use Relevance Generative Answering (RGA)
group: Usage
---
# Use Relevance Generative Answering (RGA)

A [Coveo Machine Learning (Coveo ML)](https://docs.coveo.com/en/188/) [Relevance Generative Answering (RGA)](https://docs.coveo.com/en/nbtb6010/) [model](https://docs.coveo.com/en/1012/) generates answers to complex natural language user queries in a Coveo-powered [search interface](https://docs.coveo.com/en/2741/).

The [RGA](https://docs.coveo.com/en/nbtb6010/) [model](https://docs.coveo.com/en/1012/) leverages [generative AI](https://docs.coveo.com/en/n9e90153/) technology to generate an answer based solely on the content that you specify, such as your enterprise content.
The content resides in a secure [index](https://docs.coveo.com/en/204/) in your [Coveo organization](https://docs.coveo.com/en/185/).

This article guides you through the process of integrating [Coveo RGA](https://docs.coveo.com/en/n9de0370/) in a front-end app with the [`@coveo/headless`](https://docs.coveo.com/en/headless/latest/) library.
It focuses on a [React](#getting-started-with-react) implementation, but the basics of using the library in [Angular](#angular) and vanilla [JavaScript](#javascript) will be covered.

If you’re looking to jump into code, a great place to start is with the following React quickstart.


<details>
<summary>Example React quickstart</summary>
{ @includeCode ../../../samples/headless/rga-react/src/components/Quickstart.tsx }
</details>

> [!TIP] **Core RGA type definitions** 
>
> * [`GeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html)
> * [`GeneratedAnswerProps`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerProps.html)
> * [`GeneratedAnswerState`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerState.html)


> [!TIP] **Additional type references**
> 
> * [`buildGeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildGeneratedAnswer.html)
> * [`buildInteractiveCitation`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildInteractiveCitation.html)
> * [`buildSearchEngine`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildSearchEngine.html)
> * [`GeneratedAnswerCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerCitation.html)
> * [`InteractiveCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.InteractiveCitation.html)
> * [`QueryActionCreators`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.QueryActionCreators.html)
> * [`SearchActionCreators`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchActionCreators.html)
> * [`SearchAnalyticsActionCreators`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchAnalyticsActionCreators.html)
> * [`SearchEngine`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html)
> * [`SearchEngineOptions`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngineOptions.html)

## Getting started with React

### Instantiating the engine and the controller

> [!WARNING]
> 
> Currently, only [`SearchEngine`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.SearchEngine.html) and [`InsightEngine`](https://docs.coveo.com/en/headless/latest/reference/functions/Insight.InsightEngine.html) support RGA.

This document will concentrate on implementing RGA with a `SearchEngine`, but the interactions with [`GeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html) would be the same if you were to use the `InsightEngine`.
The primary difference between the two implementations are the actions dispatched to the engines.

First, use [`buildSearchEngine`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildSearchEngine.html) to instantiate the [`SearchEngine`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html) that will be used to create your RGA controller.

{ @includeCode ../../../samples/headless/rga-react/src/lib/getSearchEngine.ts }

> [!TIP] **Type definitions**
>
> * [`SearchEngine`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html)
> * [`SearchEngineOptions`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngineOptions.html)

The RGA controller generates responses based on the context of the query submitted to the engine.
Create the RGA controller by passing a reference to an engine into [`buildGeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/functions/Search.buildGeneratedAnswer.html).

You can optionally provide `buildGeneratedAnswer` with additional configuration options, as defined by [`GeneratedAnswerProps`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerProps.html), to enhance the relevance of the response generated.

The engine is what receives dispatched actions, not the RGA controller ([`GeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html)).
This means that any code that uses RGA to generate a response needs a reference to the engine used to create the `GeneratedAnswer` controller.

{ @includeCode ../../../samples/headless/rga-react/src/lib/getAnswerGenerator.ts }

> [!TIP] **Type definitions**
>
> * [`SearchEngine`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html)
> * [`GeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html)
> * [`GeneratedAnswerProps`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerProps.html)

### Interacting with RGA

In the following example a [`SearchEngine`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html) is created.
The [`GeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html) controller is created with that engine.

{ @includeCode ../../../samples/headless/rga-react/src/lib/engines.ts }

> [!NOTE]
> All the underlying functionality of the engine remains available.
> The GeneratedAnswer controller is attached to the same engine, so search results are still accessible through `engine.state.search` while the `GeneratedAnswer` controller exposes RGA-specific state.

Import the resulting engine into your component and dispatch actions to it.
The `@coveo/headless` exports functions to create a common set of action creators, you can [extend these with your own custom set](https://docs.coveo.com/en/headless/latest/usage/extend/headless-controllers/).
You’ll need the corresponding `answerGenerator` and to `subscribe` its state changes to access the RGA response in your component.

{ @includeCode ../../../samples/headless/rga-react/src/components/AnswerGenerator.tsx }

> [!TIP] **Type definitions**
> 
> * [`GeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html)
> * [`GeneratedAnswerState`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerState.html)
> * [`QueryActionCreators`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.QueryActionCreators.html)
> * [`SearchActionCreators`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchActionCreators.html)

#### Generated Answer event tracking

The [`GeneratedAnswer`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html) controller provides methods to update its state and track user interactions.
Following is a summary of the available methods, describing their effects on [`GeneratedAnswerState`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerState.html) and whether they trigger analytics:

| Method | Effect on state | Analytics |
| --- | --- | --: |
| [`openFeedbackModal()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#openfeedbackmodal) | Sets `feedbackModalOpen` to true. | ❌|
| [`closeFeedbackModal()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#closefeedbackmodal) | Sets `feedbackModalOpen` to false. | ❌ |
| [`like()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#like) | Marks the generated answer as liked. | ✅  Logs like event |
| [`dislike()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#dislike) | Marks the generated answer as disliked. | ✅  Logs dislike event |
| [`sendFeedback(feedback: GeneratedAnswerFeedback)`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#sendfeedback) | Submits user feedback and sets `feedbackSubmitted` to true. | ✅ Logs feedback event |
| [`show()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#show) | Marks the answer as visible. | ✅ Logs show event |
| [`hide()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#hide) | Marks the answer as hidden. | ✅ Logs hide event |
| [`expand()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#expand) | Marks the answer as expanded to show full response. | ✅ Logs expand event |
| [`collapse()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#collapse) | Marks the answer as collapsed to show partial response. | ✅ Logs collapse event |
| [`enable()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#enable) | Enables the generated answer feature. | ❌ |
| [`disable()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#disable) | Disables the generated answer feature. | ❌ |
| [`logCitationClick(citationId: string)`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#logcitationclick) | ❌ | ✅ Logs citation click event |
| [`logCitationHover(citationId: string, timeMs: number)`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#logcitationhover) | ❌ | ✅Logs citation hover event |
| [`logCopyToClipboard()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#logcopytoclipboard) | ❌ | ✅ Logs copy-to-clipboard event |
| [`retry()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswer.html#retry) | Tries to generate an answer again. | ❌ |

You’ll need to integrate these events into your code to be able to generate reports for RGA in your Coveo Dashboard.
You can also find details on what actions are automatically tracked by reviewing [Relevance Generative Answering (RGA) reports and UA events](https://docs.coveo.com/en/nb6a0210/).


> [!TIP] **Type definitions**
> 
> * [`GeneratedAnswerFeedback`](https://docs.coveo.com/en/headless/latest/reference/types/Search.GeneratedAnswerFeedback.html)

### Citations List

Along with the generated answer, RGA also returns the sources it used to produce that answer.
These sources, called citations, are available through the [`citations`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerState.html#citations) field of the [`GeneratedAnswerState`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerState.html).

Each citation follows the [`GeneratedAnswerCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerCitation.html) interface, which provides useful metadata such as the source title and URI.
Citations allow users to access the original sources that contributed to the generated answer for additional context.

The following example shows how to render a list of citations after the answer has finished streaming.

{ @includeCode ../../../samples/headless/rga-react/src/components/CitationsList.tsx }

Citations also support analytic events, refer to [Citation Event Tracking](#citation-event-tracking) for details.


> [!TIP] **Type definitions**
> * [`GeneratedAnswerCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerCitation.html)
> * [`GeneratedAnswerState`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerState.html)

#### Citation event tracking

Use [`buildInteractiveCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.buildInteractiveCitation.html) to track events on a specific citation.
This allows for the gathering of analytics on which sources of information your users are finding valuable when interacting with generated answers.

Below is a quick reference to the analytic tracking events provided by `buildInteractiveCitation`.

| Method | Analytics |
| --- | --- |
| [`beginDelayedSelect()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.buildInteractiveCitation.html#begindelayedselect) | ✅ Prepares to log selection event |
| [`cancelPendingSelect()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.buildInteractiveCitation.html#cancelpendingselect) | ✅ Cancels the pending selection of `beginDelayedSelect` |
| [`select()`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.buildInteractiveCitation.html#select) | ✅ Logs the selection event |

In order to track user interactions with results, you need to instantiate the [`InteractiveCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.InteractiveCitation.html) with the specific [`GeneratedAnswerCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerCitation.html) being interacted with.
Once these events have been integrated with your code, they can be accessed in your [Coveo RGA reports](https://docs.coveo.com/en/nb6a0210/).

Following is an example of rendering a [`GeneratedAnswerCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerCitation.html) that implements event tracking.

{ @includeCode ../../../samples/headless/rga-react/src/components/Citation.tsx }

> [!TIP] **Type definitions**
> 
> * [`buildInteractiveCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.buildInteractiveCitation.html)
> * [`GeneratedAnswerCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.GeneratedAnswerCitation.html)
> * [`InteractiveCitation`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.InteractiveCitation.html)
> * [`SearchEngine`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchEngine.html)

## Angular

The following is a basic implementation of the `@coveo/headless` RGA controller in an Angular component.

<details>
<summary>Example Angular quickstart</summary>

{ @includeCode ../../../samples/headless/rga-angular/src/app/coveo-headless-rga.service.ts }

{ @includeCode ../../../samples/headless/rga-angular/src/app/coveo-headless-rga.component.ts }

{ @includeCode ../../../samples/headless/rga-angular/src/app/coveo-headless-rga.component.html }
</details>

## JavaScript

The following is a basic implementation of the `@coveo/headless` RGA Controller outside of any JavaScript framework.

<details>
<summary>Example JavaScript quickstart</summary>


{ @includeCode ../../../samples/headless/rga-native/index.js }