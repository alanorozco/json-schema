import {merge, validate} from '../../../dist/runtime.mjs';
import {
validateIsRequired,
validateString,
validateMaxLength,
validateNumber,
validateUrl
} from '../../../dist/runtime.mjs';

const validateMaxLength_0 = (obj, prop) => validateMaxLength(obj, prop, 100);
const validateMaxLength_1 = (obj, prop) => validateMaxLength(obj, prop, 200);

export default (obj) => merge([
validate(obj, 'productTagId', [validateIsRequired, validateString, validateMaxLength_0]),
validate(obj, 'brandLabel', [validateIsRequired, validateString, validateMaxLength_0]),
validate(obj, 'productTitle', [validateIsRequired, validateString, validateMaxLength_0]),
validate(obj, 'productPrice', [validateIsRequired, validateNumber]),
validate(obj, 'productImages', [validateIsRequired, validateString, validateUrl]),
validate(obj, 'productDetails', [validateIsRequired, validateString, validateMaxLength_0]),
validate(obj, 'reviewsPage', [validateIsRequired, validateString, validateUrl]),
validate(obj, 'productPriceCurrency', [validateIsRequired, validateString, validateMaxLength_0]),
validate(obj, 'productColor', [validateString, validateMaxLength_0]),
validate(obj, 'productSize', [validateString, validateMaxLength_0]),
validate(obj, 'productIcon', [validateString, validateUrl]),
validate(obj, 'productTagText', [validateString, validateMaxLength_0]),
validate(obj, 'reviewsData', [validateString, validateUrl]),
validate(obj, 'ctaText', [validateString, validateMaxLength_1]),
validate(obj, 'shippingText', [validateString, validateMaxLength_0]),
]);
