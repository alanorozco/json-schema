import { ValidationError, ValidatorFn } from "./validators";

export * from "./validators";

export const merge = <T>(arraysOrVoid: (T[] | void)[]) => {
  return (
    arraysOrVoid.reduce((a, b) => (a as T[]).concat(b || []), []) as T[]
  ).filter(Boolean);
};

export const validate = (
  obj: { [k: string]: any },
  name: string,
  calls: ValidatorFn[]
): ValidationError[] => {
  return merge(calls.map((fn) => fn(name, obj[name])));
};
