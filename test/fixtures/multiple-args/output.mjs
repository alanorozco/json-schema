import {merge, validate} from '../../../dist/runtime.mjs';
import {
validateString,
validateMaxLength
} from '../../../dist/runtime.mjs';

const validateMaxLength_0 = (obj, prop) => validateMaxLength(obj, prop, 10);
const validateMaxLength_1 = (obj, prop) => validateMaxLength(obj, prop, 5);
const validateMaxLength_2 = (obj, prop) => validateMaxLength(obj, prop, 3);

export default (obj) => merge([
validate(obj, 'foo', [validateString, validateMaxLength_0]),
validate(obj, 'bar', [validateString, validateMaxLength_1]),
validate(obj, 'baz', [validateString, validateMaxLength_2]),
]);
