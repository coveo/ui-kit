import {
  AtomicResultBadge,
  AtomicResultFieldsList,
  AtomicResultLink,
  AtomicResultMultiValueText,
  AtomicResultPrintableUri,
  AtomicResultSectionBadges,
  AtomicResultSectionBottomMetadata,
  AtomicResultSectionExcerpt,
  AtomicResultSectionTitle,
  AtomicResultSectionTitleMetadata,
  AtomicResultSectionVisual,
  AtomicResultText,
  AtomicText,
  AtomicResultSectionChildren,
  AtomicFoldedResultList,
  AtomicResultImage,
} from '@coveo/atomic-react';
import {FoldedResult} from '@coveo/headless';
import React, {FunctionComponent} from 'react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const FoldedResultListPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      sample="service"
      options={{advancedQuery: '@source=iNaturalistTaxons'}}
    >
      <AtomicFoldedResultList imageSize="large" template={MyTemplate} />
    </AtomicPageWrapper>
  );
};

function MyTemplate(result: FoldedResult) {
  return (
    <>
      <style>{`
        .salesforce-badge::part(result-badge-element) {
          background-color: #44a1da;
          color: white;
        }

        .field {
          display: inline-flex;
          align-items: center;
        }

        .field-label {
          font-weight: bold;
          margin-right: 0.25rem;
        }
      `}</style>
      <AtomicResultSectionBadges>
        <AtomicResultBadge label="Salesforce" class="salesforce-badge" />
        {result.result.raw.language && (
          <AtomicResultBadge icon="https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/language.svg">
            <AtomicResultMultiValueText field="language" />
          </AtomicResultBadge>
        )}
      </AtomicResultSectionBadges>
      <AtomicResultSectionVisual>
        <AtomicResultImage
          field="ec_images"
          fallback="https://picsum.photos/350"
        />
      </AtomicResultSectionVisual>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionTitleMetadata>
        <AtomicResultPrintableUri
          maxNumberOfParts={3}
        ></AtomicResultPrintableUri>
      </AtomicResultSectionTitleMetadata>
      <AtomicResultSectionExcerpt>
        <AtomicResultText field="excerpt" />
      </AtomicResultSectionExcerpt>
      <AtomicResultSectionChildren>
        {!!result.children.length && (
          <div>
            <b>This result has children:</b>
            <ul>
              {result.children.map((child, i) => (
                <li>
                  <b>Child {i + 1}: </b>
                  <a href={child.result.clickUri}>{child.result.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AtomicResultSectionChildren>
      <AtomicResultSectionBottomMetadata>
        <AtomicResultFieldsList>
          <>
            {result.result.raw.author && (
              <div className="field">
                <span className="field-label">
                  <AtomicText value="Author" />
                </span>
                <AtomicResultText field="author" />
              </div>
            )}
            {result.result.raw.source && (
              <div className="field">
                <span className="field-label">
                  <AtomicText value="Source" />
                </span>
                <AtomicResultText field="source" />
              </div>
            )}
            {result.result.raw.language && (
              <div className="field">
                <span className="field-label">
                  <AtomicText value="Language" />
                </span>
                <AtomicResultMultiValueText field="language" />
              </div>
            )}
            {result.result.raw.filetype && (
              <div className="field">
                <span className="field-label">
                  <AtomicText value="Filetype" />
                </span>
                <AtomicResultText field="filetype" />
              </div>
            )}
          </>
        </AtomicResultFieldsList>
      </AtomicResultSectionBottomMetadata>
    </>
  );
}
