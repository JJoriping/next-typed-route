import type { Compiler } from "webpack";
import { NextTypesPlugin } from "next/dist/build/webpack/plugins/next-types-plugin/index.js";
import Watcher from "watcher";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { relative, resolve } from "path";
import { generateEndpoint, initialize } from "./core.js";

const keyIgnorancePattern = /^\(.+?\)$/;

export default class NextTypedAPIPlugin{
  public apply(compiler:Compiler):void{
    if(compiler.options.name !== 'server') return;
    const nextTypesPlugin = compiler.options.plugins.find(v => v instanceof NextTypesPlugin) as NextTypesPlugin|undefined;
    if(!nextTypesPlugin) throw Error('Missing NextTypesPlugin in compiler.options.plugins');
    const routerType = existsSync(nextTypesPlugin.appDir) ? "appDir" : "pagesDir";
    const dir = nextTypesPlugin[routerType];
    const outputPath = resolve(compiler.context, ".next/types");
    const types = resolve(outputPath, "./next-typed-api");

    initialize(compiler.context);
    mkdirSync(types, { recursive: true });
    if(compiler.options.mode === "production"){
      run(dir);
    }else{
      const watcher = new Watcher(dir, { recursive: true, renameDetection: true });

      watcher.on('add', path => run(path));
      watcher.on('addDir', path => run(path));
      watcher.on('change', path => run(path));
      watcher.on('rename', (before, after) => run(before, after));
      watcher.on('renameDir', (before, after) => run(before, after));
      watcher.on('unlink', path => run(path));
      watcher.on('unlinkDir', path => run(path));
    }
    function run(...paths:string[]):void{
      for(const v of paths){
        const relativePath = relative(dir, v);
        const fileName = getFileName(relativePath) + ".d.ts";
        if(!existsSync(v) && existsSync(resolve(types, fileName))){
          unlinkSync(resolve(types, fileName));
          continue;
        }
        if(statSync(v).isDirectory()){
          run(...readdirSync(v).map(w => resolve(v, w)));
          continue;
        }
        const R = generateEndpoint(getKey(relativePath), v);
        if(!R) continue;
        writeFileSync(resolve(types, fileName), R);
      }
    }
  }
}
function getKey(value:string):string{
  const chunk = value.split(/[\\/]/);
  const R:string[] = [];

  chunk.pop();
  for(const v of chunk){
    if(keyIgnorancePattern.test(v)){
      continue;
    }
    R.push(v);
  }
  return R.join('/');
}
function getFileName(value:string):string{
  return value.replace(/[\\/.]/g, "_");
}