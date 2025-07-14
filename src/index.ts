/* eslint-disable unicorn/prevent-abbreviations */
import type { NextURL } from "next/dist/server/web/next-url.js";
import type { NextRequest, NextResponse } from "next/server.js";
import type { ReactNode } from "react";
import type { CallAPIOptions, DefaultRequestObject, CallAPIArgumentsOf, PageArgumentsOf, QueryObjectOf } from "./types.js";
import { dynamicSegmentPatterns } from "./constants.js";

type NoSymbolOf<T> = {
  [key in keyof T]: Exclude<T[key], symbol>
};
type NeverToUnknown<T> = T extends never ? unknown : T;
interface AugmentedNextURL<T extends string> extends NextURL{
  searchParams:TypedURLSearchParams<T>;
}

export type NextTypedRoute<Req = DefaultRequestObject, Res = void> = (
  req:Omit<NextRequest, 'json'|'nextUrl'|'formData'>&{
    'json': () => Promise<NeverToUnknown<(Req extends { 'body': infer R } ? R : never)>>,
    'formData': () => Promise<Req extends { 'body': TypedFormData<infer R> } ? TypedFormData<R> : never>,
    'nextUrl': AugmentedNextURL<Req extends { 'query': infer R extends string } ? R : never>
  },
  { params }:{ 'params': Record<string, string|string[]> }
) => NextResponse<Res>|Promise<NextResponse<Res>>;
// NOTE params and searchParams become Promise instances since Next.js 15!
export type NextTypedPage<Page extends keyof NextPageTable, Q extends string = never, P = {}> = (props:P&{
  'params': NoSymbolOf<NextPageTable[Page]['params']>,
  'searchParams': QueryObjectOf<Q>
}) => ReactNode;
export type NextTypedLayout<Page extends keyof NextPageTable> = (props:{
  'params': NoSymbolOf<NextPageTable[Page]['params']>,
  'children': ReactNode
}) => ReactNode;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NextEndpointTable{}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NextPageTable{}
export type Endpoint<Req, Res> = { 'req': Req, 'res': Res };
export interface TypedURLSearchParams<T extends string> extends URLSearchParams{
  get(name:Exclude<T, `${string}[]`|`${string}?`>):string;
  get(name:T extends `${infer R}?` ? R : never):string|null;
  getAll(name:T extends `${infer R}[]` ? R : never):string[];
}
export interface TypedFormData<T extends string> extends FormData{
  get(name:Exclude<T, `${string}[]`|`${string}?`|`{${string}}`>):string;
  get(name:Exclude<T extends `${infer R}?` ? R : never, `{${string}}`>):string|null;
  get(name:T extends `{${infer R}}` ? R : never):File;
  get(name:T extends `{${infer R}}?` ? R : never):File|null;
  getAll(name:Exclude<T extends `${infer R}[]` ? R : never, `{${string}}`>):string[];
  getAll(name:T extends `{${infer R}}[]` ? R : never):File[];
}

export const emptyParamSymbol = Symbol("Empty parameter");
export function page<T extends keyof NextPageTable>(path:T, ...args:PageArgumentsOf<T>):string{
  const searchParams = new URLSearchParams();
  let result = path as string;
  let pathResolved = false;

  result = result.replace(dynamicSegmentPatterns.optionalCatchAll, (_, g1:string) => {
    const list = (args[0] as Record<string, string[]>|undefined)?.[g1] || [];

    pathResolved = true;
    if(list.length) list.unshift("");
    return list.join('/');
  }).replace(dynamicSegmentPatterns.catchAll, (_, g1:string) => {
    const list = (args[0] as Record<string, string[]>)[g1] || [];

    pathResolved = true;
    if(list.length) list.unshift("");
    else list.unshift(`/(missing ${g1})`);
    return list.join('/');
  }).replace(dynamicSegmentPatterns.normal, (_, g1:string) => {
    const chunk = (args[0] as Record<string, string|typeof emptyParamSymbol>)[g1];

    pathResolved = true;
    if(chunk === emptyParamSymbol) return "";
    return "/" + (chunk || `(missing ${g1})`);
  });
  if(args[pathResolved ? 1 : 0]) for(const [ k, v ] of Object.entries(args[pathResolved ? 1 : 0] as Record<string, string|string[]>)){
    if(Array.isArray(v)){
      for(const w of v) searchParams.append(k, w);
    }else{
      searchParams.append(k, v);
    }
  }
  if(searchParams.size){
    result += "?" + searchParams.toString();
  }
  return result;
}
export default function callAPI<T extends keyof NextEndpointTable>(path:T, ...args:CallAPIArgumentsOf<T>):Promise<NextEndpointTable[T]['res']>{
  return callRawAPI(path, ...args).then(res => res.json());
}
export function callRawAPI<T extends keyof NextEndpointTable>(path:T, ...args:CallAPIArgumentsOf<T>):Promise<Response>{
  let method:string, url:string|URL;
  [ method, url ] = (path as string).split(' ');
  const requestObject = args[0] as Record<string, any>|undefined;
  const { host, headers = {}, ...fetchOptions } = requestObject?.['options'] as CallAPIOptions || {};
  const params = requestObject?.['params'] as Record<string, string|string[]|undefined>|undefined;
  const query = requestObject?.['query'] as Record<string, string|string[]|undefined>|undefined;
  const [ contentType, body ] = ((data:unknown) => {
    if(data === undefined){
      return [ undefined, undefined ];
    }
    if(data instanceof FormData){
      return [ undefined, data ];
    }
    return [ 'application/json', JSON.stringify(data) ];
  })(requestObject?.['body']);

  if(params){
    for(const [ k, v ] of Object.entries(params)){
      switch(typeof v){
        case "string":
          url = url.replaceAll(`[${k}]`, v);
          break;
        case "undefined":
          url = url.replaceAll(`/[[...${k}]]`, "");
          break;
        default:
          url = url.replaceAll(`[...${k}]`, v.join('/'));
          break;
      }
    }
  }
  if(query){
    const searchParams = new URLSearchParams();
    for(const [ k, v ] of Object.entries(query)){
      if(v === undefined) continue;
      if(typeof v === "string"){
        searchParams.append(k, v);
      }else for(const w of v){
        searchParams.append(k, w);
      }
    }
    url = `${url}?${searchParams.toString()}`;
  }
  if(host){
    url = new URL(url, host);
  }
  if(contentType){
    headers['Content-Type'] ||= contentType;
  }
  return fetch(url, {
    method,
    headers,
    body,
    ...fetchOptions
  });
}