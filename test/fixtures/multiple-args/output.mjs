import {merge, validate} from '../../../dist/runtime.mjs';
import {
validateStringLength
} from '../../../dist/runtime.mjs';

const validateStringLength_0 = (obj, prop) => validateStringLength(obj, prop, 10);
const validateStringLength_1 = (obj, prop) => validateStringLength(obj, prop, 5);
const validateStringLength_2 = (obj, prop) => validateStringLength(obj, prop, 3);

export default (obj) => merge([
validate(obj, 'foo', [validateStringLength_0]),
validate(obj, 'bar', [validateStringLength_1]),
validate(obj, 'baz', [validateStringLength_2]),
]);
