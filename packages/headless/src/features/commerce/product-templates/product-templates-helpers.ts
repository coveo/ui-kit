import {isArray, isNullOrUndefined} from '@coveo/bueno';
import {ChildProduct, Product} from '../../../api/commerce/common/product';
import {ProductTemplateCondition} from './product-templates-manager';

/**
 * Extracts a property from a product object.
 * @param product (Product) - The target product.
 * @param property (string) - The property to extract.
 * @returns (unknown) The value of the specified property in the specified product, or null if the property does not exist.
 */
export const getProductProperty = (
  product: Product | ChildProduct,
  property: string
) => {
  const anyProduct = product as unknown as Record<string, unknown>;

  if (!isNullOrUndefined(anyProduct[property])) {
    return anyProduct[property];
  }

  if (!isNullOrUndefined(product.additionalFields[property])) {
    return product.additionalFields[property];
  }

  return null;
};

/**
 * Extracts the required properties from standard lookup fields for the purpose of recording analytics events on
 * end-user interactions with a product.
 *
 * The properties are:
 *
 * - name: The displayed name of the product. The function will attempt to extract the name from the ec_name field first, then from the ec_product_id field, and finally from the permanentid field.
 * - price: The displayed price of the product. This function will attempt to extract the price from the ec_promo_price field first, and then from the ec_price field.
 * - productId: The unique ID of the product. This function will attempt to extrat the ID from the ec_product_id field first, and then from the permanentid field.
 *
 * If any of the required properties can't be extracted from the standard lookup fields, a warning message will be generated.
 *
 * @param product (Product) - The target product.
 * @returns (Record<string, unknown>) An object containing the required properties for logging analytics events, as well as a warning message if any of the required properties are missing.
 */
export const getRequiredProductPropertiesForAnalytics = (product: Product) => {
  const productId = getProductIdFromStandardLookupFields(product);
  const productName = getProductNameFromStandardLookupFields(product);
  const productPrice = getProductPriceFromStandardLookupFields(product);
  const warnings: string[] = [];
  if (productId.warning) {
    warnings.push(productId.warning);
  }
  if (productName.warning) {
    warnings.push(productName.warning);
  }
  if (productPrice.warning) {
    warnings.push(productPrice.warning);
  }

  const properties = {
    productId: productId.value,
    name: productName.value,
    price: productPrice.value,
    warning:
      warnings.length === 0
        ? undefined
        : `Some of the properties required for logging analytics events are missing for product '${product.permanentid}':
    \n- ${warnings.join('\n- ')}
    \nReview the configuration of the above 'ec_'-prefixed fields in your index, and make sure they contain the correct metadata.`,
  };

  return properties;
};

/**
 * Creates a condition that verifies if the specified fields are defined.
 * @param fieldNames (string[]) - A list of fields that must be defined.
 * @returns (ProductTemplateCondition) A function that takes a product and checks if every field in the specified list is defined.
 */
export const fieldsMustBeDefined = (
  fieldNames: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    return fieldNames.every(
      (fieldName) => !isNullOrUndefined(getProductProperty(product, fieldName))
    );
  };
};

/**
 * Creates a condition that verifies if the specified fields are not defined.
 * @param fieldNames (string[]) - A list of fields that must not be defined.
 * @returns (ProductTemplateCondition) A function that takes a product and checks if every field in the specified list is not defined.
 */
export const fieldsMustNotBeDefined = (
  fieldNames: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    return fieldNames.every((fieldName) =>
      isNullOrUndefined(getProductProperty(product, fieldName))
    );
  };
};

/**
 * Creates a condition that verifies whether the value of a field is equal to any of the specified values (casing insensitive).
 * @param fieldName (string) - The name of the field to evaluate the condition against.
 * @param allowedValues (string[]) - The list of values that the field value can be equal to in order for the condition to evaluate to "true" (case insensitive).
 * @returns (ProductTemplateCondition) - A function that takes a Product as an argument and returns "true" if the value for the specified field is equal to any of the values in the specified list (case insensitive), and "false" otherwise.
 */
export const fieldMustMatch = (
  fieldName: string,
  valuesToMatch: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    const fieldValues = getFieldValuesFromProduct(fieldName, product);
    return valuesToMatch.some((valueToMatch) =>
      fieldValues.some(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() === valueToMatch.toLowerCase()
      )
    );
  };
};

/**
 * Creates a condition that verifies whether the value of a field is not equal to any of the specified values (case insensitive).
 * @param fieldName (string) - The name of the field to evaluate the condition against.
 * @param disallowedValues (string[]) - The list of values that the field value must not be equal to in order for the condition to evaluate to "true" (case insensitive).
 * @returns (ProductTemplateCondition) A function that takes a Product as an argument and returns "true" if the value for the specified field is not equal to any of the values in the given list (case insensitive), or "false" otherwise.
 */
export const fieldMustNotMatch = (
  fieldName: string,
  disallowedValues: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    const fieldValues = getFieldValuesFromProduct(fieldName, product);
    return disallowedValues.every((disallowedValues) =>
      fieldValues.every(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() !== disallowedValues.toLowerCase()
      )
    );
  };
};

const getFieldValuesFromProduct = (
  fieldName: string,
  product: Product | ChildProduct
) => {
  const rawValue = getProductProperty(product, fieldName);
  return isArray(rawValue) ? rawValue : [rawValue];
};

const getFirstValidStringFieldValueFromProduct = (
  fieldNames: string[],
  product: Product
) => {
  const rawValues = fieldNames.map((fieldName) =>
    getProductProperty(product, fieldName)
  );

  const value = rawValues.find((value) => typeof value === 'string');

  if (value === undefined) {
    return value;
  }

  return value as string;
};

const getCouldNotRetrievePropertyWarning = (
  property: string,
  lookupFields: string[]
) =>
  `'${property}' could not be retrieved from field${lookupFields.length > 1 ? 's' : ''} '${lookupFields.join("', '")}'.`;

const getFirstValidNumberFieldValueFromProduct = (
  fieldNames: string[],
  product: Product
) => {
  const rawValues = fieldNames.map((fieldName) =>
    getProductProperty(product, fieldName)
  );

  const value = rawValues.find((value) => typeof value === 'number');

  if (value === undefined) {
    return value;
  }

  return value as number;
};

export const getProductNameFromStandardLookupFields = (product: Product) => {
  const lookupFields = ['ec_name', 'ec_product_id', 'permanentid'];
  const value = getFirstValidStringFieldValueFromProduct(lookupFields, product);
  let warning;
  if (!value) {
    warning = getCouldNotRetrievePropertyWarning('name', lookupFields);
  }
  return {
    warning,
    value,
  };
};

export const getProductPriceFromStandardLookupFields = (product: Product) => {
  const lookupFields = ['ec_promo_price', 'ec_price'];
  const value = getFirstValidNumberFieldValueFromProduct(lookupFields, product);
  let warning;
  if (!value) {
    warning = getCouldNotRetrievePropertyWarning('price', lookupFields);
  }
  return {
    warning,
    value,
  };
};

export const getProductIdFromStandardLookupFields = (product: Product) => {
  const lookupFields = ['ec_product_id', 'permanentid'];
  const value = getFirstValidStringFieldValueFromProduct(lookupFields, product);
  let warning;
  if (!value) {
    warning = getCouldNotRetrievePropertyWarning('productId', lookupFields);
  }
  return {
    warning,
    value,
  };
};

export const ProductTemplatesHelpers = {
  getProductProperty,
  getRequiredProductPropertiesForAnalytics,
  fieldsMustBeDefined,
  fieldsMustNotBeDefined,
  fieldMustMatch,
  fieldMustNotMatch,
};
