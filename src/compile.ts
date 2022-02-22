import { ValidatorName } from "./validators";

type ValidatorCalls = {
  [property: string]: string[];
};

type ValidatorCall = {
  fn: ValidatorName;
  args: any[];
};

export type JsonSchema = {
  [key: string]: any;
};

type JsonSchemaProperty = JsonSchemaStringProperty | JsonSchemaNumberProperty;

type JsonSchemaNumberProperty = {
  type: "integer" | "number";
};

type JsonSchemaStringProperty = {
  type: "string";
  format: "uri" | undefined;
  maxLength: number | undefined;
};

interface ArgFn {
  name: ValidatorName;
  argFnName: string;
  args: any[];
}

interface Mapping {
  fnImports: string[];
  argFns: ArgFn[];
  calls: ValidatorCalls;
}

export function mapToCalls(schema: JsonSchema): Mapping {
  const { properties } = schema;
  const calls: ValidatorCalls = {};

  const fnImports = new Set();

  let argFn = 0;

  const argFns: Map<string, ArgFn> = new Map();

  function fnNameWithArgs(name: ValidatorName, args: any[]) {
    const serial = JSON.stringify([name, ...args]);
    if (argFns.has(serial)) {
      return argFns.get(serial).argFnName;
    }
    const argFnName = `${name}_${argFn++}`;
    argFns.set(serial, {
      name,
      argFnName,
      args,
    });
    return argFnName;
  }

  function addCall(
    propertyCalls: ValidatorCalls,
    property: string,
    fn: ValidatorName,
    ...args: any[]
  ) {
    fnImports.add(fn);
    let usableName = fn;
    if (args.length) {
      usableName = fnNameWithArgs(fn, args);
    }
    propertyCalls[property] = propertyCalls[property] || [];
    propertyCalls[property].push(usableName);
  }

  // Required check should always go first
  for (const name of schema.required || []) {
    addCall(calls, name, "validateIsRequired");
  }

  for (const propEntry of Object.entries(properties)) {
    const [name, property] = propEntry as [string, JsonSchemaProperty];
    switch (property.type) {
      case "integer":
        addCall(calls, name, "validateIsInteger");
        break;
      case "number":
        addCall(calls, name, "validateNumber");
        break;
      case "string":
        const { format, maxLength } = property;
        if (format === "uri") {
          addCall(calls, name, "validateUrl");
        }
        if (typeof maxLength === "number") {
          addCall(calls, name, "validateStringLength", maxLength);
        }
        break;
    }
  }
  return {
    fnImports: Array.from(fnImports),
    argFns: Object.values(Object.fromEntries(argFns)),
    calls,
  };
}

const generateDefineFn = ({ argFnName, args, name }) =>
  `
const ${argFnName} = (obj, prop) => ${name}(${[
    "obj",
    "prop",
    ...args.map((arg) => JSON.stringify(arg)),
  ].join(", ")});
`.trim();

interface CompileOptions {
  helperPath: string | undefined;
}

export function compileJsonSchemaToSource(
  schema: JsonSchema,
  { helperPath }: CompileOptions = {
    helperPath: "json-schema",
  }
): string {
  const { argFns, calls, fnImports } = mapToCalls(schema);
  const out = `
import {merge, validate} from '${helperPath}';
import {
__imports__
} from '${helperPath}/validators';

__fn_defs__

export default (obj) => merge([
__validations__
]);
  `
    .trim()
    .replace("__imports__", fnImports.join(",\n"))
    .replace("__fn_defs__", argFns.map(generateDefineFn).join("\n"))
    .replace(
      "__validations__",
      Object.entries(calls)
        .map(
          ([property, calls]) =>
            `validate(obj, '${property}', [${calls.join(", ")}]),`
        )
        .join("\n")
    );
  return out;
}
