import {merge, validate} from 'json-schema';
import {
validateIsRequired,
validateStringLength,
validateNumber,
validateUrl
} from 'json-schema/validators';

const validateStringLength_0 = (obj, prop) => validateStringLength(obj, prop, 100);
const validateStringLength_1 = (obj, prop) => validateStringLength(obj, prop, 200);

export default (obj) => merge([
validate(obj, 'productTagId', [validateIsRequired, validateStringLength_0]),
validate(obj, 'brandLabel', [validateIsRequired, validateStringLength_0]),
validate(obj, 'productTitle', [validateIsRequired, validateStringLength_0]),
validate(obj, 'productPrice', [validateIsRequired, validateNumber]),
validate(obj, 'productImages', [validateIsRequired, validateUrl]),
validate(obj, 'productDetails', [validateIsRequired, validateStringLength_0]),
validate(obj, 'reviewsPage', [validateIsRequired, validateUrl]),
validate(obj, 'productPriceCurrency', [validateIsRequired, validateStringLength_0]),
validate(obj, 'productColor', [validateStringLength_0]),
validate(obj, 'productSize', [validateStringLength_0]),
validate(obj, 'productIcon', [validateUrl]),
validate(obj, 'productTagText', [validateStringLength_0]),
validate(obj, 'reviewsData', [validateUrl]),
validate(obj, 'ctaText', [validateStringLength_1]),
validate(obj, 'shippingText', [validateStringLength_0]),
]);