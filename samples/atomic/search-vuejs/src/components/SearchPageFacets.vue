<template>
  <atomic-facet-manager>
    <atomic-category-facet
      field="ec_category"
      label="Category"
      with-search="true"
    ></atomic-category-facet>
    <atomic-facet field="ec_brand" label="Brand"></atomic-facet>
    <atomic-numeric-facet
      field="cat_review_count"
      label="Amount of reviews"
      display-values-as="link"
    >
      <atomic-numeric-range
        start="0"
        end="150"
        label="Few"
      ></atomic-numeric-range>
      <atomic-numeric-range
        start="150"
        end="650"
        label="A moderate amount"
      ></atomic-numeric-range>
      <atomic-numeric-range
        start="650"
        end="9999999999999"
        label="A lot"
      ></atomic-numeric-range>
    </atomic-numeric-facet>
    <atomic-color-facet
      field="cat_color"
      label="Color"
      number-of-values="6"
      sort-criteria="occurrences"
    >
    </atomic-color-facet>
    <atomic-numeric-facet field="ec_price" label="Cost" with-input="integer">
      <atomic-format-currency currency="USD"></atomic-format-currency>
    </atomic-numeric-facet>
    <atomic-timeframe-facet with-date-picker="true" label="Listed within">
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
      <atomic-timeframe
        unit="year"
        amount="10"
        period="next"
      ></atomic-timeframe>
    </atomic-timeframe-facet>
    <atomic-rating-facet
      field="ec_rating"
      label="Rating"
      number-of-intervals="5"
    ></atomic-rating-facet>
    <atomic-rating-range-facet
      field="ec_rating"
      label="Rating range"
      number-of-intervals="5"
      facet-id="ec_rating_range"
    >
    </atomic-rating-range-facet>
    <atomic-facet field="source"></atomic-facet>
  </atomic-facet-manager>
</template>
