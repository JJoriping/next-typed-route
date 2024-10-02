import test from "node:test";
import { generateEndpoint, initialize } from "./core.js";
import { resolve } from "path";

initialize(resolve());
test("generateEndpoint(path)", () => {
  generateEndpoint("test", resolve("res/test-1.ts"));
});