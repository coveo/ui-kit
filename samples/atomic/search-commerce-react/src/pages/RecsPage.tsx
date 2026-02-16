import {
  AtomicFormatCurrency,
  AtomicRecsInterface,
  AtomicRecsList,
  AtomicResultBadge,
  AtomicResultDate,
  AtomicResultFieldsList,
  AtomicResultImage,
  AtomicResultLink,
  AtomicResultMultiValueText,
  AtomicResultNumber,
  AtomicResultPrintableUri,
  AtomicResultRating,
  AtomicResultSectionBadges,
  AtomicResultSectionBottomMetadata,
  AtomicResultSectionEmphasized,
  AtomicResultSectionExcerpt,
  AtomicResultSectionTitle,
  AtomicResultSectionTitleMetadata,
  AtomicResultSectionVisual,
  AtomicResultText,
  AtomicText,
} from '@coveo/atomic-react/recommendation';
import {
  buildRecommendationEngine,
  type Result,
} from '@coveo/headless/recommendation';
import {type FunctionComponent, useMemo} from 'react';

export const RecsPage: FunctionComponent = () => {
  const organizationId = 'electronicscoveodemocomo0n2fu8v';
  const engine = useMemo(
    () =>
      buildRecommendationEngine({
        configuration: {
          accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
          organizationId,
          pipeline: 'UI_KIT_E2E',
          searchHub: 'UI_KIT_E2E',
        },
      }),
    []
  );

  return (
    <AtomicRecsInterface
      engine={engine}
      fieldsToInclude={[
        'ec_price',
        'ec_rating',
        'ec_images',
        'ec_brand',
        'cat_platform',
        'cat_condition',
        'cat_categories',
        'cat_review_count',
        'cat_color',
      ]}
      localization={(i18n) => {
        i18n.addResourceBundle('en', 'translation', {
          'no-ratings-available': 'No ratings available',
        });
      }}
    >
      <AtomicRecsList
        numberOfRecommendations={9}
        numberOfRecommendationsPerPage={3}
        label="Recommendations"
        display="grid"
        template={MyTemplate}
      />
    </AtomicRecsInterface>
  );
};

function MyTemplate(result: Result) {
  return (
    <>
      <style>{`
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
        <AtomicResultBadge field="ec_brand" />
      </AtomicResultSectionBadges>
      <AtomicResultSectionVisual>
        <AtomicResultImage field="ec_images" />
      </AtomicResultSectionVisual>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionTitleMetadata>
        <AtomicResultRating field="ec_rating" />
        <AtomicResultPrintableUri maxNumberOfParts={3} />
      </AtomicResultSectionTitleMetadata>
      <AtomicResultSectionEmphasized>
        <AtomicResultNumber field="ec_price">
          <AtomicFormatCurrency currency="USD" />
        </AtomicResultNumber>
      </AtomicResultSectionEmphasized>
      <AtomicResultSectionExcerpt>
        <AtomicResultText field="ec_shortdesc" />
      </AtomicResultSectionExcerpt>
      <AtomicResultSectionBottomMetadata>
        <AtomicResultFieldsList>
          <div className="field">
            <AtomicText value="Date" />
            <AtomicResultDate format="ddd MMM D YYYY" />
          </div>
          {result.raw.cat_platform !== undefined && (
            <div className="field">
              <span className="field-label">
                <AtomicText value="Platform" />
              </span>
              <AtomicResultText field="cat_platform" />
            </div>
          )}
          {result.raw.cat_condition !== undefined && (
            <div className="field">
              <span className="field-label">
                <AtomicText value="Condition" />
              </span>
              <AtomicResultText field="cat_condition" />
            </div>
          )}
          {result.raw.cat_categories !== undefined && (
            <div className="field">
              <span className="field-label">
                <AtomicText value="Tags" />
              </span>
              <AtomicResultMultiValueText field="cat_categories" />
            </div>
          )}
        </AtomicResultFieldsList>
      </AtomicResultSectionBottomMetadata>
    </>
  );
}
