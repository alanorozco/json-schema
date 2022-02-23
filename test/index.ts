import { compileJsonSchemaToSource } from "../src/compile";
import { extname, basename } from "path";
import { readFile, stat, writeFile } from "fs/promises";
import * as glob from "fast-glob";
import { test } from "uvu";
import * as assert from "uvu/assert";

const dir = "test/fixtures";
const runtime = "../../../dist/runtime.mjs";

const getSchemaInputFilename = (name) => `${dir}/${name}/input.json`;
const getSchemaOutputFilename = (name) => `${dir}/${name}/output.mjs`;

const isUpdate = process.env.IS_UPDATE === "1";

async function exists(filename) {
  try {
    await stat(filename);
    return true;
  } catch {
    return false;
  }
}

const removeExtension = (filename) =>
  filename.substring(0, filename.length - extname(filename).length);

async function writeOrCompare(filename, actual) {
  let expected = actual;
  if (!isUpdate && (await exists(filename))) {
    expected = await readFile(filename, "utf8");
  } else {
    await writeFile(filename, actual);
  }
  assert.equal(expected, actual);
}

async function testCompiled(inputFile, outputFile) {
  const output = compileJsonSchemaToSource(
    JSON.parse(await readFile(inputFile, "utf8")),
    { runtime }
  );
  await writeOrCompare(outputFile, output);
}

async function testValidated(testCase, testFile) {
  const importPath = `../../${getSchemaOutputFilename(testCase)}`;
  const { default: validate } = await import(importPath);
  const input = JSON.parse(await readFile(testFile, "utf8"));
  const output = JSON.stringify(validate(input), null, 2) + "\n";
  const outputFile = `${removeExtension(testFile)}.output.json`;
  await writeOrCompare(outputFile, output);
}

const testCases = glob.sync("*", {
  cwd: dir,
  onlyDirectories: true,
});
for (const name of testCases) {
  test(`${name}:compile`, () =>
    testCompiled(getSchemaInputFilename(name), getSchemaOutputFilename(name)));

  const validatedFiles = glob.sync([
    `${dir}/${name}/validated/*.json`,
    "!**/*.output.json",
  ]);
  for (const validatedFile of validatedFiles) {
    const testName = basename(removeExtension(validatedFile));
    test(`${name}:validated — ${testName}`, () =>
      testValidated(name, validatedFile));
  }
}

test.run();
