import { compileJsonSchemaToSource } from "../src/compile";
import { basename } from "path";
import { readFile, stat, writeFile } from "fs/promises";
import glob from "fast-glob";
import { test } from "uvu";
import * as assert from "uvu/assert";

const isUpdate = process.env.IS_UPDATE === "1";

async function exists(filename) {
  try {
    await stat(filename);
    return true;
  } catch {
    return false;
  }
}

const getSchemaOutputFilename = (inputFile) =>
  `test/fixtures/${basename(inputFile)}.mjs`;

async function writeOrCompare(filename, actual) {
  let expected = actual;
  if (!isUpdate && (await exists(filename))) {
    expected = await readFile(filename, "utf8");
  } else {
    await writeFile(filename, actual);
  }
  assert.equal(expected, actual);
}

async function testFixture(schemaFile) {
  const outputFile = getSchemaOutputFilename(schemaFile);
  const output = compileJsonSchemaToSource(
    JSON.parse(await readFile(schemaFile, "utf8")),
    { helperPath: "../../dist/index.mjs" }
  );
  await writeOrCompare(outputFile, output);
}

async function testRunnable(schemaFile, testFile) {
  const importPath = `../../${getSchemaOutputFilename(schemaFile)}`;
  const { default: validate } = await import(importPath);
  const input = JSON.parse(await readFile(testFile, "utf8"));
  const output = JSON.stringify(validate(input), null, 2);
  const outputFile = `${testFile}.output.json`;
  await writeOrCompare(outputFile, output);
}

const schemaFiles = glob.sync("test/fixtures/*.json");
for (const schemaFile of schemaFiles) {
  const schemaName = basename(schemaFile, ".json");
  test(schemaName, () => testFixture(schemaFile));

  const testFiles = glob.sync([
    `test/fixtures/${schemaName}/*.json`,
    "!**/*.output.json",
  ]);
  for (const testFile of testFiles) {
    const testName = basename(testFile, ".json");
    test(`${schemaName} — ${testName}`, () =>
      testRunnable(schemaFile, testFile));
  }
}

test.run();
