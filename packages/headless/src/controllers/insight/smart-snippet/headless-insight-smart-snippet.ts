// import {InsightEngine} from '../../../app/insight-engine/insight-engine';
// import { buildInteractiveResultCore } from '../../core/interactive-result/headless-core-interactive-result';
// import {
//   SmartSnippet,
//   SmartSnippetProps,
//   buildCoreSmartSnippet,
// } from '../../core/smart-snippet/headless-core-smart-snippet';
// import { buildSmartSnippetInteractiveInlineLinks } from './headless-insight-smart-snippet-interactive-inline-links';

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippet` controller instance.
 * */
// export function buildSmartSnippet(
//   engine: InsightEngine,
//   props?: SmartSnippetProps
// ) : SmartSnippet {
//   const smartSnippet = buildCoreSmartSnippet(engine);

//   const getState = () => engine.state;

//   let lastSearchResponseId: string | null = null;
//   const interactiveResult = buildInteractiveResultCore(
//     engine,
//     {options: {selectionDelay: props?.options?.selectionDelay}},
//     () => {
//       const result = smartSnippet.state.source;
//       if(!result) {
//         lastSearchResponseId = null;
//         return;
//       }

//       const {searchResponseId} = getState().search;
//       if(lastSearchResponseId === searchResponseId) {
//         return;
//       }
//       lastSearchResponseId = searchResponseId;
//       // engine.dispatch(logOpenSmartSnippetSource);
//     }
//   )
// }
