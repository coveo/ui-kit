/**
 * Builds an object representing an attached result, mapping fields from the result to a custom structure.
 *
 * @param {Object} result - The result object to attach.
 * @param {string} caseId - The ID of the case the result is being attached to.
 * @returns {Object} The formatted attached result.
 */
const createAttachedResult = (result, caseId) => {
  const isPermanentIdAvailable = !!result.raw.permanentid;
  const identifierKey = isPermanentIdAvailable ? 'permanentId' : 'uriHash';
  const identifierValue = isPermanentIdAvailable
    ? result.raw.permanentid
    : result.raw.urihash;

  const clickUriToUse = result.clickUri || result.uri;
  const titleToUse = result.title || result.clickUri;

  return {
    articleLanguage: result.raw.sflanguage,
    articleVersionNumber: result.raw.sfversionnumber,
    articlePublishStatus: result.raw.sfpublishstatus,
    caseId: caseId,
    customs: {},
    knowledgeArticleId: result.raw.sfkbid,
    name: titleToUse.substr(0, 70) + (titleToUse.length > 80 ? '...' : ''),
    [identifierKey]: identifierValue,
    resultUrl:
      clickUriToUse.substr(0, 250) + (clickUriToUse > 250 ? '...' : ''),
    source: result.raw.source,
    title: titleToUse.substr(0, 250) + (titleToUse.length > 250 ? '...' : ''),
  };
};

/**
 * Builds a simplified object representing a result to detach from a case.
 *
 * @param {Object} result - The result object to detach.
 * @param {string} caseId - The ID of the case the result is being detached from.
 * @returns {Object} The result object with minimal detachment info.
 */
const buildResultToDetach = (result, caseId) => {
  const isPermanentIdAvailable = !!result.raw.permanentid;
  return {
    uriHash: isPermanentIdAvailable
      ? result.raw.permanentid
      : result.raw.urihash,
    sfkbid: result.raw.sfkbid,
    caseId: caseId,
  };
};

/**
 * Validates and builds a formatted result object to attach to a case.
 * Returns an error message string if validation fails.
 *
 * @param {Object} result - The result object to attach.
 * @param {string} caseId - The ID of the case.
 * @returns {Object|string} The result to attach or an error message string.
 */
const buildResultToAttach = (result, caseId) => {
  if (!result.raw.permanentid && !result.raw.urihash) {
    const errorMessage =
      "You're missing either the permanentId field or the uriHash field.";
    return errorMessage;
  }

  const requiredFields = ['source'];
  const requiredFieldsMissing = [];

  // Temporary variable so we don't modify *this.result.raw.sfkbversionnumber*
  let actualSfkbVersionNumber =
    result.raw.sfkbversionnumber || result.raw.sfversionnumber;

  // If we have an article, also check articleLanguage and articleVersionNumber
  if (result.raw.sfkbid && actualSfkbVersionNumber) {
    requiredFields.push('articleLanguage');

    // Make sure *sfkbversionnumber* is a Number
    actualSfkbVersionNumber = Number(actualSfkbVersionNumber);

    if (isNaN(actualSfkbVersionNumber)) {
      const errorMessage = 'The field sfkbversionnumber is not a valid number.';
      console.warn(errorMessage);
      return errorMessage;
    }
  }

  const resultToAttach = createAttachedResult(result, caseId);

  requiredFields.forEach((field) => {
    if (!resultToAttach[field] || resultToAttach[field] === '') {
      requiredFieldsMissing.push(field);
    }
  });

  if (requiredFieldsMissing.length > 0) {
    const errorMessage = `The result you are trying to attach is missing the ${requiredFieldsMissing.join(', ')} field(s).`;
    return errorMessage;
  }

  return resultToAttach;
};

/**
 * Transforms a list of attached results into a Headless-compatible payload.
 * Converts articleVersionNumber to string and removes null values.
 *
 * @param {Object[]} attachedResults - The list of attached result objects.
 * @returns {Object[]} The cleaned and transformed payload.
 */
const buildAttachedResultsPayloadHeadless = (attachedResults) => {
  /*
   * Mapping between Apex data schema and Headless data schema.
   */
  const builtAttachedResults = attachedResults
    .filter((attachedResult) => attachedResult.title)
    .map((attachedResult) => {
      if (attachedResult.articleVersionNumber) {
        return {
          ...attachedResult,
          articleVersionNumber: `${attachedResult.articleVersionNumber}`,
        };
      }
      return attachedResult;
    });
  // Removes null values
  return builtAttachedResults.map((result) =>
    Object.fromEntries(Object.entries(result).filter((val) => val[1] != null))
  );
};

export {
  createAttachedResult,
  buildResultToAttach,
  buildAttachedResultsPayloadHeadless,
  buildResultToDetach,
};
