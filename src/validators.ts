export type ValidationError = string;

export type ValidationResult = void | ValidationError[];

export type ValidatorFn = (name: string, value: any) => ValidationResult;

export const validateIsInteger = (
  name: string,
  value: any
): ValidationResult => {
  if (value == null) return;
  if (typeof value !== "number" || Math.floor(value) !== value) {
    return [`${name} must be an integer`];
  }
};

export const validateIsRequired = (
  name: string,
  value: any
): ValidationResult => {
  if (!!value !== value && !value) {
    return [`${name} is required`];
  }
};

export const validateNumber = (name: string, value: any): ValidationResult => {
  if (value == null) return;
  if (typeof value !== "number") {
    return [`${name} must be a number`];
  }
};

export const validateStringLength = (
  name: string,
  value: any,
  length: number = 100
): ValidationResult => {
  if (value == null) return;
  if (typeof value !== "string" || value.length > length) {
    return [`${name} must be a string under ${length} characters long`];
  }
};

export const validateUrl = (name: string, value: string) => {
  if (value == null) return;
  if (typeof value !== "string" || !value.startsWith("https://")) {
    return [`${name} must be a valid URL starting with https://`];
  }
};

export type ValidatorName =
  | "validateIsInteger"
  | "validateIsRequired"
  | "validateUrl"
  | "validateNumber"
  | "validateStringLength";
