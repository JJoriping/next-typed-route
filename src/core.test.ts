import test from "node:test";
import { resolve } from "path";
import assert from "assert";
import { writeFileSync } from "fs";
import { generateEndpoint, getParametersType, initialize } from "./core.js";

initialize(resolve());
test("generateEndpoint()", () => {
  writeFileSync("res/test-1.out.ts", generateEndpoint('[slug]/test', resolve("res/test-1.ts"))!);
});
test("getParametersType()", () => {
  assert.strictEqual(getParametersType('foo'), 'never');
  assert.strictEqual(getParametersType('app/blog/[slug]'), '{\'slug\':string}');
  assert.strictEqual(getParametersType('app/shop/[...slug]'), '{\'slug\':string[]}');
  assert.strictEqual(getParametersType('app/shop/[[...slug]]'), '{\'slug\':string[]|undefined}');
  assert.strictEqual(getParametersType('app/[categoryId]/[itemId]'), '{\'categoryId\':string,\'itemId\':string}');
});