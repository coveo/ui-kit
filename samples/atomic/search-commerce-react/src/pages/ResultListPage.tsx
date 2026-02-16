import {AtomicResultLink, AtomicResultList} from '@coveo/atomic-react';
import type {FunctionComponent} from 'react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const ResultListPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper sample="electronics">
      <AtomicResultList
        display="grid"
        template={() => ({
          contentTemplate: (
            <>
              Hi!
              <AtomicResultLink />
            </>
          ),
          linkTemplate: <></>,
        })}
      />
    </AtomicPageWrapper>
  );
};

// function MyTemplate(result: Result) {
//   return (
//     <>
//       <style>{`
//         .field {
//           display: inline-flex;
//           align-items: center;
//         }

//         .field-label {
//           font-weight: bold;
//           margin-right: 0.25rem;
//         }
//       `}</style>
//       <AtomicResultSectionBadges>
//         <AtomicResultBadge field="ec_brand" />
//       </AtomicResultSectionBadges>
//       <AtomicResultSectionVisual>
//         <AtomicResultImage field="ec_images" />
//       </AtomicResultSectionVisual>
//       <AtomicResultSectionTitle>
//         <AtomicResultLink />
//       </AtomicResultSectionTitle>
//       <AtomicResultSectionTitleMetadata>
//         <AtomicResultRating field="ec_rating" />
//         <AtomicResultPrintableUri maxNumberOfParts={3} />
//       </AtomicResultSectionTitleMetadata>
//       <AtomicResultSectionEmphasized>
//         <AtomicResultNumber field="ec_price">
//           <AtomicFormatCurrency currency="USD" />
//         </AtomicResultNumber>
//       </AtomicResultSectionEmphasized>
//       <AtomicResultSectionExcerpt>
//         <AtomicResultText field="ec_shortdesc" />
//       </AtomicResultSectionExcerpt>
//       <AtomicResultSectionBottomMetadata>
//         <AtomicResultFieldsList>
//           <div className="field">
//             <AtomicText value="Date" />
//             <AtomicResultDate format="ddd MMM D YYYY" />
//           </div>
//           {result.raw.cat_platform !== undefined && (
//             <div className="field">
//               <span className="field-label">
//                 <AtomicText value="Platform" />
//               </span>
//               <AtomicResultText field="cat_platform" />
//             </div>
//           )}
//           {result.raw.cat_condition !== undefined && (
//             <div className="field">
//               <span className="field-label">
//                 <AtomicText value="Condition" />
//               </span>
//               <AtomicResultText field="cat_condition" />
//             </div>
//           )}
//           {result.raw.cat_categories !== undefined && (
//             <div className="field">
//               <span className="field-label">
//                 <AtomicText value="Tags" />
//               </span>
//               <AtomicResultMultiValueText field="cat_categories" />
//             </div>
//           )}
//         </AtomicResultFieldsList>
//       </AtomicResultSectionBottomMetadata>
//     </>
//   );
// }
