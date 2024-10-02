import { existsSync } from "fs";
import { resolve } from "path";
import { warning } from "@daldalso/logger";
import { Project, SyntaxKind } from "ts-morph";

const appRouterKeywords = [ "GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS" ];
const typeTextPattern = /@daldalso\/next-typed-api\b/;
const dynamicSegmentPattern = /\[]/;

let project:Project;

export function initialize(rootPath:string):void{
  const tsConfigFilePath = resolve(rootPath, "tsconfig.json");
  if(!existsSync(tsConfigFilePath)){
    throw Error("Could not find tsconfig.json");
  }
  project = new Project({ tsConfigFilePath });
}
export function generateEndpoint(key:string, path:string):string|undefined{
  const R = [
    "// Auto-generated by @daldalso/next-typed-api"
  ];
  const parametersType = getParametersType(key);
  const file = project.addSourceFileAtPath(path);
  let accepted = false;

  for(const v of file.getImportDeclarations()){
    R.push(v.getText());
  }
  for(const v of file.getTypeAliases()){
    R.push(v.getText());
  }
  for(const v of file.getInterfaces()){
    R.push(v.getText());
  }
  R.push(
    "import type { Endpoint } from \"@daldalso/next-typed-api\";",
    "export module \"@daldalso/next-typed-api\"{",
    "  export interface NextRoutingTable{"
  );
  for(const [ k, v ] of file.getExportedDeclarations()){
    if(!appRouterKeywords.includes(k)) continue;
    for(const w of v){
      if(!w.isKind(SyntaxKind.VariableDeclaration)) continue;
      const typeNode = w.getTypeNode();
      if(!typeNode?.isKind(SyntaxKind.TypeReference)){
        warning(`Unexpected type "${typeNode?.getText()}" for the variable "${k}"`)['Path'](path);
        continue;
      }
      const typeText = typeNode.getType().getText();
      if(!typeTextPattern.test(typeText)){
        warning(`Unexpected type "${typeText}" for the variable "${k}"`)['Path'](path);
        continue;
      }
      const [ requestType, responseType ] = typeNode.getTypeArguments();

      R.push(`    '${k} /${key}':Endpoint<${requestType ? requestType.getText() : "never"}, ${responseType ? responseType.getText() : "never"}, ${parametersType}>;`);
      accepted = true;
    }
  }
  project.removeSourceFile(file);
  if(accepted){
    R.push("  }", "}");
    return R.join('\n');
  }
  return undefined;
}
function getParametersType(key:string):string{
  // TODO
  return "never";
}