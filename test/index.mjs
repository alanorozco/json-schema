import { compileJsonSchemaToSource } from "../src/compile";
import { basename } from "path";
import { readFile, stat, writeFile } from "fs/promises";
import glob from "fast-glob";
async function exists(filename) {
  try {
    await stat(filename);
    return true;
  } catch {
    return false;
  }
}
async function testFixture(inputFile) {
  const outputFile = `test/fixtures/${basename(inputFile)}.validate.js`;
  const output = compileJsonSchemaToSource(JSON.parse(await readFile(inputFile, "utf8")));
  if (!await exists(outputFile)) {
    await writeFile(outputFile, output);
  }
}
async function test() {
  const inputFiles = await glob("test/fixtures/*.schema.json");
  for (const inputFile of inputFiles) {
    await testFixture(inputFile);
  }
}
test();
