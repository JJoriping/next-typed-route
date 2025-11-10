import assert from "assert";
import { Command } from "commander";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { Project } from "ts-morph";
import { Definition, DefinitionOrBoolean, generateSchema, JsonSchemaGenerator } from "typescript-json-schema";
import { Document, YAMLMap } from "yaml";

const program = new Command()
  .command("openapi [options]")
  .option("--title <value>")
  .option("--version <value>")
  .option("--filter <pattern>")
  .action((command, options) => {
    switch(command){
      case "openapi":
        openapi(options);
        break;
    }
  })
;
if(process.argv.length <= 2) program.help();
else program.parse();

function openapi(options:{ 'title'?: string, 'version'?: string, 'filter'?: string }):void{
  // @ts-expect-error getDefinitionForRootType is private
  const _getDefinitionForRootType = JsonSchemaGenerator.prototype.getDefinitionForRootType;
  // @ts-expect-error getDefinitionForRootType is private
  JsonSchemaGenerator.prototype.getDefinitionForRootType = function(this:JsonSchemaGenerator, ...args:any[]){
    // setting ignoreUndefined to true
    return _getDefinitionForRootType.call(this, args[0], args[1], args[2], args[3], true);
  };

  const project = new Project({
    tsConfigFilePath: resolve("tsconfig.json")
  });
  const pattern = new RegExp(options.filter || ".*");
  const schema = generateSchema(project.getProgram().compilerObject as any, "NextEndpointTable", { ignoreErrors: true, constAsEnum: true, required: true });
  assert(schema?.properties, "Generation failed");
  const paths:Record<string, Record<string, unknown>> = {};

  for(const [ k, v ] of Object.entries(schema.properties)){
    if(!pattern.test(k)) continue;
    const [ method, path ] = k.split(" ");
    const actualMethod = method.toLowerCase();
    const actualPath = path.replace(/\[(.+?)\]/g, "{$1}");
    const object:any = {};
    assert(typeof v === "object" && v.properties);
    const { req, res } = v.properties;
    assert(typeof req === "object" && typeof res === "object");
    const mergedReq = mergeAllOf(req);
    const responses = new YAMLMap();

    if(mergedReq.properties){
      const parameters:any[] = [];
      const { params, body, query } = mergedReq.properties;

      if(typeof body === "object") object['requestBody'] = {
        required: true,
        content: {
          'application/json': {
            schema: body
          }
        }
      }
      if(typeof query === "object" && query.enum){
        for(const w of query.enum){
          const optional = String(w).endsWith("?");

          parameters.push({
            name: optional ? String(w).slice(0, -1) : w,
            in: "query",
            required: !optional,
            schema: {
              type: "string"
            }
          });
        }
      }
      if(typeof params === "object" && params.properties){
        for(const l in params.properties) parameters.push({
          name: l,
          in: "path",
          required: true,
          schema: {
            type: "string"
          }
        });
      }
      if(parameters.length) object['parameters'] = parameters;
    }
    responses.set(200, {
      content: {
        'application/json': {
          schema: res
        }
      }
    });
    paths[actualPath] ||= {};
    paths[actualPath][actualMethod] = object;
    object['responses'] = responses;
  }
  writeFileSync("openapi.yaml", new Document({
    openapi: "3.0.2",
    info: {
      title: options.title || "No title",
      version: options.version || "No version"
    },
    paths
  }).toString());
}
function mergeAllOf(object:Definition):Definition{
  if(!object.allOf) return object;
  assert(object.allOf.every(v => typeof v === "object" && v.properties));

  return {
    type: "object",
    properties: object.allOf.reduce((pv, v) => {
      return Object.assign(pv, (v as Definition).properties);
    }, {} as Record<string, DefinitionOrBoolean>)
  };
}