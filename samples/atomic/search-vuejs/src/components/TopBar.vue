<template>
  <div class="topbar">
    <atomic-query-summary enable-duration="false"></atomic-query-summary>
    <atomic-refine-toggle></atomic-refine-toggle>
    <atomic-sort-dropdown>
      <atomic-sort-expression
        label="Relevance"
        expression="relevancy"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="Price (low to high)"
        expression="ec_price ascending"
      >
      </atomic-sort-expression>
      <atomic-sort-expression
        label="Price (high to low)"
        expression="ec_price descending"
      >
      </atomic-sort-expression>
    </atomic-sort-dropdown>
  </div>
</template>
