import { compileJsonSchemaToSource } from "../src/compile";
import { basename, extname } from "path";
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

async function testFixture(inputFile) {
  const outputFile = `test/fixtures/${basename(inputFile)}.js`;
  const output = compileJsonSchemaToSource(
    JSON.parse(await readFile(inputFile, "utf8"))
  );
  let expected = output;
  if (!isUpdate && (await exists(outputFile))) {
    expected = await readFile(outputFile, "utf8");
  } else {
    await writeFile(outputFile, output);
  }
  assert.equal(expected, output);
}

const inputFiles = glob.sync("test/fixtures/*.json");
for (const inputFile of inputFiles) {
  const name = basename(inputFile, extname(inputFile));
  test(name, () => testFixture(inputFile));
  const runnableTests = glob.sync(`test/fixtures/${name}/*.input.json`);
  console.log(runnableTests);
}

test.run();
