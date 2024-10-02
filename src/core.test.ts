import test from "node:test";
import { resolve } from "path";
import assert from "assert";
import { generateEndpoint, getParametersType, initialize } from "./core.js";

initialize(resolve());
test("generateEndpoint()", () => {
  generateEndpoint('test', resolve("res/test-1.ts"));
});
test("getParametersType()", () => {
  assert.strictEqual(getParametersType('foo'), 'never');
  assert.deepStrictEqual(JSON.parse(getParametersType('app/blog/[slug]')), { slug: "string" });
  assert.deepStrictEqual(JSON.parse(getParametersType('app/shop/[...slug]')), { slug: "string[]" });
  assert.deepStrictEqual(JSON.parse(getParametersType('app/shop/[[...slug]]')), { slug: "string[]|undefined" });
  assert.deepStrictEqual(JSON.parse(getParametersType('app/[categoryId]/[itemId]')), { categoryId: "string", itemId: "string" });
});