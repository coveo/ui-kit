export default `<style>
  .field {
    display: inline-flex;
    align-items: center;
  }

  .field-label {
    font-weight: bold;
    margin-right: 0.25rem;
  }
</style>

<atomic-result-section-visual>
  <atomic-result-icon class="icon"></atomic-result-icon>
</atomic-result-section-visual>

<atomic-result-section-title>
  <atomic-result-link></atomic-result-link>
</atomic-result-section-title>

<atomic-result-section-excerpt>
  <atomic-result-text field="excerpt"></atomic-result-text>
</atomic-result-section-excerpt>

<atomic-result-section-bottom-metadata>
  <atomic-result-fields-list>
    <atomic-field-condition class="field" if-defined="author">
      <span class="field-label">
        <atomic-text value="author"></atomic-text>:
      </span>
      <atomic-result-text field="author"></atomic-result-text>
    </atomic-field-condition>

    <atomic-field-condition class="field" if-defined="source">
      <span class="field-label">
        <atomic-text value="source"></atomic-text>:
      </span>
      <atomic-result-text field="source"></atomic-result-text>
    </atomic-field-condition>

    <atomic-field-condition class="field" if-defined="language">
      <span class="field-label">
        <atomic-text value="language"></atomic-text>:
      </span>
      <atomic-result-multi-value-text
        field="language"
      ></atomic-result-multi-value-text>
    </atomic-field-condition>

    <atomic-field-condition class="field" if-defined="filetype">
      <span class="field-label">
        <atomic-text value="fileType"></atomic-text>:
      </span>
      <atomic-result-text field="filetype"></atomic-result-text>
    </atomic-field-condition>

    <span class="field">
      <span class="field-label">Date:</span>
      <atomic-result-date></atomic-result-date>
    </span>
  </atomic-result-fields-list>
</atomic-result-section-bottom-metadata>
`;
