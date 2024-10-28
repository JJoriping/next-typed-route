import type { Compiler } from "webpack";
import { NextTypesPlugin } from "next/dist/build/webpack/plugins/next-types-plugin/index.js";
import Watcher from "watcher";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { relative, resolve } from "path";
import { generateEndpointDefinition, generateEnvDefinition, generatePageDefinition, initialize } from "./core.js";

const keyIgnorancePattern = /^\(.+?\)$/;
const pageFilePattern = /(?:^|[\\/])page\.(?:jsx?|tsx?)$/;
const envFilePattern = /^\.env(\..+)?$/;

export default class NextTypedRoutePlugin{
  public apply(compiler:Compiler):void{
    if(compiler.options.name !== 'server') return;
    const nextTypesPlugin = compiler.options.plugins.find(v => v instanceof NextTypesPlugin) as NextTypesPlugin|undefined;
    if(!nextTypesPlugin) throw Error('Missing NextTypesPlugin in compiler.options.plugins');
    const routerType = existsSync(nextTypesPlugin.appDir) ? "appDir" : "pagesDir";
    const dir = nextTypesPlugin[routerType];
    const outputPath = resolve(compiler.context, ".next/types");
    const types = resolve(outputPath, "./next-typed-route");

    initialize(compiler.context);
    mkdirSync(types, { recursive: true });
    copyFileSync(resolve(import.meta.dirname, "../res/next.d.ts"), resolve(types, "next.d.ts"));
    if(compiler.options.mode === "production"){
      runSrc(dir);
      runEnv();
    }else{
      const srcWatcher = new Watcher(dir, { recursive: true, renameDetection: true });
      const envWatcher = new Watcher(compiler.context);

      srcWatcher.on('add', path => runSrc(path));
      srcWatcher.on('addDir', path => runSrc(path));
      srcWatcher.on('change', path => runSrc(path));
      srcWatcher.on('rename', (before, after) => runSrc(before, after));
      srcWatcher.on('renameDir', (before, after) => runSrc(before, after));
      srcWatcher.on('unlink', path => runSrc(path));
      srcWatcher.on('unlinkDir', path => runSrc(path));

      envWatcher.on('change', () => runEnv());
      envWatcher.on('unlink', () => runEnv());
    }
    function runSrc(...paths:string[]):void{
      for(const v of paths){
        const relativePath = relative(dir, v);
        const fileName = getFileName(relativePath) + ".d.ts";
        if(!existsSync(v)){
          if(existsSync(resolve(types, fileName))){
            unlinkSync(resolve(types, fileName));
          }
          continue;
        }
        if(statSync(v).isDirectory()){
          runSrc(...readdirSync(v).map(w => resolve(v, w)));
          continue;
        }
        let R:string|undefined;
        if(pageFilePattern.test(relativePath)){
          R = generatePageDefinition(getKey(relativePath), v);
        }else{
          R = generateEndpointDefinition(getKey(relativePath), v);
        }
        if(!R) continue;
        writeFileSync(resolve(types, fileName), R);
      }
    }
    function runEnv():void{
      for(const v of readdirSync(compiler.context)){
        if(!envFilePattern.test(v)) continue;
        const fileName = getFileName(v) + ".d.ts";
        const R = generateEnvDefinition(getKey(v), resolve(compiler.context, v));

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