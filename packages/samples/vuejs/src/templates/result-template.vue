<script setup lang="ts">
import ResultTextField from "../components/ResultTextField.vue";
import ResultTextFieldMultivalue from "../components/ResultTextFieldMultivalue.vue";
</script>

<template>
  <atomic-result-template>
    <template v-pre>
      <atomic-result-section-title>
        <h2>
          <atomic-result-link></atomic-result-link>
        </h2>
      </atomic-result-section-title>
      <atomic-result-section-emphasized>
        <atomic-result-number field="ec_price">
          <atomic-format-currency currency="USD"></atomic-format-currency>
        </atomic-result-number>
      </atomic-result-section-emphasized>
      <atomic-result-section-title-metadata>
        <atomic-result-rating field="ec_rating"></atomic-result-rating>
        <atomic-result-printable-uri max-number-of-parts="3"></atomic-result-printable-uri>
      </atomic-result-section-title-metadata>
      <atomic-result-section-badges>
        <atomic-result-badge field="ec_brand"></atomic-result-badge>
      </atomic-result-section-badges>
      <atomic-result-section-visual>
        <atomic-result-image field="ec_images" aria-hidden="true"></atomic-result-image>
      </atomic-result-section-visual>
      <atomic-result-section-excerpt>
        <atomic-result-text field="ec_shortdesc"></atomic-result-text>
      </atomic-result-section-excerpt>
      <atomic-result-section-bottom-metadata>
        <atomic-result-fields-list>
          <atomic-field-condition class="field" if-defined="cat_platform">
            <ResultTextField label="Platform" field="cat_platform"></ResultTextField>
          </atomic-field-condition>
          <atomic-field-condition class="field" if-defined="cat_condition">
            <ResultTextField label="Condition" field="cat_condition"></ResultTextField>
          </atomic-field-condition>
          <atomic-field-condition class="field" if-defined="cat_categories">
            <ResultTextFieldMultivalue label="Tags" field="cat_categories"></ResultTextFieldMultivalue>
          </atomic-field-condition>
        </atomic-result-fields-list>
      </atomic-result-section-bottom-metadata>
    </template>
  </atomic-result-template>
</template>
