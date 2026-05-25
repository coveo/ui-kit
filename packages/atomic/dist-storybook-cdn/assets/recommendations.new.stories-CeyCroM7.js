import{n as e}from"./chunk-jRWAZmH_.js";import{St as t,Tt as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./is-test-mode-CTyrSANe.js";import{n as a,t as o}from"./common-meta-parameters-BmIbTEf7.js";import{n as s,t as c}from"./mock-CSDYADVl.js";import{getSampleRecommendationEngineConfiguration as l}from"/headless/v3.50.1/recommendation/headless.esm.js";async function u(e){await customElements.whenDefined(`atomic-recs-interface`),await e.querySelector(`atomic-recs-interface`).initialize({...l()})}var d,f,p,m;e((()=>{t(),s(),o(),i(),d=new c,f={component:`content-recs-page`,title:`Recommendations/Example Pages`,id:`content-recs-page`,parameters:{...a,layout:`fullscreen`,msw:{handlers:[...d.handlers]},chromatic:{disableSnapshot:!1}},render:()=>n`
    <style>
      .content-recs-layout {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .recs-carousel {
        --atomic-recs-number-of-columns: 5;
      }

      atomic-recs-list::part(label) {
        font-size: var(--atomic-text-2xl);
        font-weight: 600;
        padding-bottom: 1rem;
        color: #2c3e50;
      }

      .content-metadata {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        color: #6c757d;
      }

      .category-badge {
        display: inline-block;
        padding: 4px 12px;
        background-color: #e3f2fd;
        color: #1976d2;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      @media only screen and (max-width: 1600px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 4;
        }
      }

      @media only screen and (max-width: 1280px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 3;
        }
      }

      @media only screen and (max-width: 768px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 2;
        }
      }

      @media only screen and (max-width: 480px) {
        .recs-carousel {
          --atomic-recs-number-of-columns: 1;
        }
      }
    </style>
    <div class="content-recs-layout">
      <!-- Recommended Articles Carousel -->
      <atomic-recs-interface
        class="recs-carousel"
        fields-to-include='["author", "date", "category", "source"]'
        language-assets-path="./lang"
        icon-assets-path="./assets"
        .analytics=${r()}
      >
        <atomic-recs-list
          label="Recommended Articles"
          display="grid"
          number-of-recommendations="10"
          number-of-recommendations-per-page="5"
        >
          <atomic-recs-result-template>
            <template>
              <style>
                div.result-root.with-sections.display-list.image-small
                  atomic-result-section-visual {
                  height: 180px;
                }
                .content-metadata {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 0.875rem;
                  color: #6c757d;
                  flex-wrap: wrap;
                }
                .category-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  background-color: #e3f2fd;
                  color: #145ea9;
                  border-radius: 12px;
                  font-size: 0.75rem;
                  font-weight: 500;
                  text-transform: uppercase;
                }
              </style>
              <atomic-result-section-visual>
                <atomic-result-image
                  field="image"
                  aria-hidden="true"
                ></atomic-result-image>
              </atomic-result-section-visual>
              <atomic-result-section-badges>
                <atomic-field-condition if-defined="category">
                  <span class="category-badge">
                    <atomic-result-text field="category"></atomic-result-text>
                  </span>
                </atomic-field-condition>
              </atomic-result-section-badges>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-title-metadata>
                <div class="content-metadata">
                  <atomic-field-condition if-defined="author">
                    <atomic-result-text field="author"></atomic-result-text>
                  </atomic-field-condition>
                  <atomic-field-condition if-defined="date">
                    <span>•</span>
                    <atomic-format-date format="MMM DD, YYYY">
                      <atomic-result-date field="date"></atomic-result-date>
                    </atomic-format-date>
                  </atomic-field-condition>
                </div>
              </atomic-result-section-title-metadata>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
            </template>
          </atomic-recs-result-template>
        </atomic-recs-list>
        <atomic-recs-error></atomic-recs-error>
      </atomic-recs-interface>
    </div>
  `,play:async e=>{let t=e.canvasElement.querySelectorAll(`atomic-recs-interface`);await Promise.all(Array.from(t).map(async e=>{await u(e.parentElement)})),await Promise.all(Array.from(t).map(async e=>{await e.getRecommendations()}))}},p={name:`Recommendations Page`},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Recommendations Page'
}`,...p.parameters?.docs?.source}}},m=[`ContentRecommendations`]}))();export{p as ContentRecommendations,m as __namedExportsOrder,f as default};