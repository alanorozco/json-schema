import {merge, validate} from 'json-schema';
import {
validateStringLength
} from 'json-schema/validators';

const validateStringLength_0 = (obj, prop) => validateStringLength(obj, prop, 200);
const validateStringLength_1 = (obj, prop) => validateStringLength(obj, prop, 100);

export default (obj) => merge([
validate(obj, 'foo', [validateStringLength_0]),
validate(obj, 'bar', [validateStringLength_1]),
validate(obj, 'baz', [validateStringLength_1]),
]);