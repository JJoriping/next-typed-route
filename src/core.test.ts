import test from "node:test";
import { resolve } from "path";
import { generateEndpoint, initialize } from "./core.js";

initialize(resolve());
test("generateEndpoint(path)", () => {
  console.log(generateEndpoint('foo/[bar]', resolve("res/test-1.ts")));
});