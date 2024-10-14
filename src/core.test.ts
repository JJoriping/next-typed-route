import assert from "assert";
import test from "node:test";
import { getParametersType } from "./core.js";

test("getParametersType()", () => {
  assert.strictEqual(getParametersType('foo'), 'unknown');
  assert.strictEqual(getParametersType('app/blog/[slug]'), '{\'slug\':string|typeof emptyParamSymbol}');
  assert.strictEqual(getParametersType('app/shop/[...slug]'), '{\'slug\':string[]}');
  assert.strictEqual(getParametersType('app/shop/[[...slug]]'), '{\'slug\'?:string[]}');
  assert.strictEqual(getParametersType('app/[categoryId]/[itemId]'), '{\'categoryId\':string|typeof emptyParamSymbol,\'itemId\':string|typeof emptyParamSymbol}');
});