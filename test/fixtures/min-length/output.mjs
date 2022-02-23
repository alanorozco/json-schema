import {merge, validate} from '../../../dist/runtime.mjs';
import {
validateString,
validateMinLength
} from '../../../dist/runtime.mjs';

const validateMinLength_0 = (obj, prop) => validateMinLength(obj, prop, 3);

export default (obj) => merge([
validate(obj, 'foo_hasMinLength3', [validateString, validateMinLength_0]),
]);
