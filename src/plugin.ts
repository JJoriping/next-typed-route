import Webpack from "webpack";

const PLUGIN_NAME = "next-typed-api";

export default class NextTypedAPIPlugin{
  public apply(compiler:Webpack.Compiler):void{
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.processAssets.tapAsync({
        name: PLUGIN_NAME
      }, async (assets, callback) => {
        // TODO
        void compiler;
        assets.test = new Webpack.sources.RawSource("Hello, World!");
        debugger;
        callback();
      });
    });
  }
}