import { resolve } from "node:path";
import test from "node:test";
import { readFileSync, rmSync } from "node:fs";
import assert from "node:assert";
import type { Compiler } from "webpack";
import { NextTypesPlugin } from "next/dist/build/webpack/plugins/next-types-plugin/index.js";
import NextTypedRoutePlugin from "./plugin.js";

const plugin = new NextTypedRoutePlugin();

test("NextTypedRoutePlugin", () => {
  plugin.apply({
    context: "",
    options: {
      name: "server",
      mode: "production",
      plugins: [
        new NextTypesPlugin({
          appDir: resolve("res/testbed/app"),
          dev: false,
          dir: resolve("res/testbed"),
          distDir: resolve("dist"),
          isEdgeServer: false,
          typedRoutes: false,
          pageExtensions: [],
          originalRedirects: undefined,
          originalRewrites: undefined
        })
      ]
    } as any
  } as Compiler);

  rmSync(resolve(".next"), { recursive: true });
});
function assertFileContent(path:string, pattern:string|RegExp):void{
  const content = readFileSync(path).toString();

  if(typeof pattern === "string"){
    assert(content.includes(pattern));
  }else{
    assert(pattern.test(content));
  }
}