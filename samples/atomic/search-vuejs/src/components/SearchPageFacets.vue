<template>
  <atomic-facet-manager>
    <atomic-facet field="source" label="Source"></atomic-facet>
    <atomic-facet field="objecttype" label="Type"></atomic-facet>
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
      label="Rating Range"
      number-of-intervals="5"
      facet-id="ec_rating_range"
    >
    </atomic-rating-range-facet>
  </atomic-facet-manager>
</template>
