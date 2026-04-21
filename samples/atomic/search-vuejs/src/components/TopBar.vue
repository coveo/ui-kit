<template>
  <div class="topbar">
    <atomic-query-summary enable-duration="false"></atomic-query-summary>
    <atomic-refine-toggle></atomic-refine-toggle>
    <atomic-sort-dropdown>
      <atomic-sort-expression
        label="Relevance"
        expression="relevancy"
      ></atomic-sort-expression>
    </atomic-sort-dropdown>
  </div>
</template>
