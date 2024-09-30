import type { Compiler } from "webpack";
import { NextTypesPlugin } from "next/dist/build/webpack/plugins/next-types-plugin/index.js";
import Watcher from "watcher";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { relative, resolve } from "path";
import { generateEndpoint } from "./core.js";

export default class NextTypedAPIPlugin{
  public apply(compiler:Compiler):void{
    if(compiler.options.name !== 'server') return;
    const nextTypesPlugin = compiler.options.plugins.find(v => v instanceof NextTypesPlugin) as NextTypesPlugin|undefined;
    if(!nextTypesPlugin) throw Error('Missing NextTypesPlugin in compiler.options.plugins');
    const routerType = existsSync(nextTypesPlugin.appDir) ? "appDir" : "pagesDir";
    const dir = nextTypesPlugin[routerType];
    const watcher = new Watcher(dir, { renameDetection: true });
    let outputPath = compiler.options.output.path;
    if(!outputPath) throw Error('Unknown output path');
    outputPath = resolve(outputPath, '../types');
    const types = resolve(outputPath, "./next-typed-api");

    mkdirSync(types, { recursive: true });
    watcher.on('add', path => run(path));
    watcher.on('addDir', path => run(path));
    watcher.on('change', path => run(path));
    watcher.on('rename', (before, after) => run(before, after));
    watcher.on('renameDir', (before, after) => run(before, after));
    watcher.on('unlink', path => run(path));
    watcher.on('unlinkDir', path => run(path));

    function run(...paths:string[]):void{
      for(const v of paths){
        const fileName = sanitizePath(relative(dir, v)) + ".d.ts";
    
        if(!existsSync(v)){
          unlinkSync(fileName);
          continue;
        }
        if(statSync(v).isDirectory()){
          run(...readdirSync(v).map(w => resolve(v, w)));
          continue;
        }
        writeFileSync(resolve(types, fileName), generateEndpoint(resolve(dir, v)));
      }
    }
  }
}
function sanitizePath(value:string):string{
  return value.replace(/[\\/.]/g, "_");
}