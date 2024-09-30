import { parse } from "path";
import TypeScript from "typescript";

export function generateEndpoint(path:string):string{
  const ast = TypeScript.createSourceFile(
    parse(path).name,
    TypeScript.sys.readFile(path)!,
    TypeScript.ScriptTarget.Latest
  );
  return `Hello, ${ast.text.slice(0, 100)}!`;
}