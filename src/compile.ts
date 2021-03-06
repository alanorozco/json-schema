import { ValidatorName } from "./validators";

export type JsonSchema = {
  [key: string]: any;
};

type JsonSchemaProperty = JsonSchemaStringProperty | JsonSchemaNumberProperty;

type JsonSchemaNumberProperty = {
  type: "integer" | "number";
};

type JsonSchemaStringProperty = {
  type: "string";
  format?: "uri";
  minLength?: number;
  maxLength?: number;
};

type WrappedFn = {
  name: string;
  wraps: ValidatorName;
  args: any[];
};

type PropertyFn = { name: ValidatorName } | WrappedFn;

type PropertyFns = {
  [property: string]: PropertyFn[];
};

interface ProgramMap {
  fnImports: ValidatorName[];
  wrappedFns: WrappedFn[];
  propertyFns: PropertyFns;
}

export function createProgramMap(schema: JsonSchema): ProgramMap {
  const { properties } = schema;

  const fnImports: Set<ValidatorName> = new Set();
  const wrappedFns: Map<string, WrappedFn> = new Map();
  const propertyFns: PropertyFns = {};

  let wrappedFnId = 0;

  function createPropertyFn(wraps: ValidatorName, args: any[]): PropertyFn {
    if (!args.length) {
      return { name: wraps };
    }
    const serial = JSON.stringify([wraps, ...args]);
    if (wrappedFns.has(serial)) {
      return wrappedFns.get(serial);
    }
    const name = `${wraps}_${wrappedFnId++}`;
    const fn = { wraps, name, args };
    wrappedFns.set(serial, fn);
    return fn;
  }

  function addPropertyFn(
    propertyFns: PropertyFns,
    property: string,
    fn: ValidatorName,
    ...args: any[]
  ) {
    fnImports.add(fn);
    propertyFns[property] = propertyFns[property] || [];
    propertyFns[property].push(createPropertyFn(fn, args));
  }

  // Required check should always go first
  for (const name of schema.required || []) {
    addPropertyFn(propertyFns, name, "validateIsRequired");
  }

  for (const propEntry of Object.entries(properties)) {
    const [name, property] = propEntry as [string, JsonSchemaProperty];
    switch (property.type) {
      case "integer":
        addPropertyFn(propertyFns, name, "validateIsInteger");
        break;
      case "number":
        addPropertyFn(propertyFns, name, "validateNumber");
        break;
      case "string":
        const { format, minLength, maxLength } = property;
        addPropertyFn(propertyFns, name, "validateString");
        if (format === "uri") {
          addPropertyFn(propertyFns, name, "validateUrl");
        }
        if (typeof minLength === "number") {
          addPropertyFn(propertyFns, name, "validateMinLength", minLength);
        }
        if (typeof maxLength === "number") {
          addPropertyFn(propertyFns, name, "validateMaxLength", maxLength);
        }
        break;
    }
  }
  return {
    fnImports: Array.from(fnImports),
    wrappedFns: Object.values(Object.fromEntries(wrappedFns)),
    propertyFns: propertyFns,
  };
}

const generateDefineFn = ({ name, wraps, args }: WrappedFn) =>
  `
const ${name} = (obj, prop) => ${wraps}(${[
    "obj",
    "prop",
    ...args.map((arg) => JSON.stringify(arg)),
  ].join(", ")});
`.trim();

const generateValidatorCall = (property: string, fns: PropertyFn[]) =>
  `validate(obj, '${property}', [${fns.map(({ name }) => name).join(", ")}]),`;

interface CompileOptions {
  runtime?: string;
}

export function compileJsonSchemaToSource(
  schema: JsonSchema,
  { runtime = "json-schema" }: CompileOptions = {}
): string {
  const { wrappedFns, propertyFns, fnImports } = createProgramMap(schema);
  const out = `
import {merge, validate} from '${runtime}';
import {
__imports__
} from '${runtime}';

__fn_defs__

export default (obj) => merge([
__validations__
]);
  `
    .trim()
    .replace("__imports__", fnImports.join(",\n"))
    .replace("__fn_defs__", wrappedFns.map(generateDefineFn).join("\n"))
    .replace(
      "__validations__",
      Object.entries(propertyFns)
        .map(([property, fns]) => generateValidatorCall(property, fns))
        .join("\n")
    );
  return out + "\n";
}
