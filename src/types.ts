import type { NextEndpointTable, NextPageTable, TypedFormData } from "./index.js";

// NOTE Next.js 16 does not allow `never`
export type DefaultRequestObject = {
  'query': unknown,
  'body': unknown
};
export type CallAPIOptions = Omit<RequestInit, 'method'|'headers'|'body'>&{
  'host'?: string,
  'headers'?: Record<string, string>
};
export type CallAPIArgumentsOf<T extends keyof NextEndpointTable> = unknown extends NextEndpointTable[T]['req']
  ? [requestObject?:{ 'options': CallAPIOptions }]
  : [
    requestObject:{
      [key in keyof NextEndpointTable[T]['req'] as unknown extends NextEndpointTable[T]['req'][key] ? never : key]: key extends "query"
        ? QueryObjectOf<NextEndpointTable[T]['req'][key]>
        : NextEndpointTable[T]['req'][key] extends TypedFormData<any>
        ? FormData
        : NextEndpointTable[T]['req'][key]
    }&{ 'options'?: CallAPIOptions }
  ]
;
export type QueryObjectOf<T extends string> = {
  [key in T as key extends `${string}?`|`${string}[]` ? never : key]: string
}&{
  [key in T as key extends `${infer R}[]` ? R : never]: string[]
}&{
  [key in T as key extends `${infer R}?` ? R : never]?: string
};
export type PageArgumentsOf<T extends keyof NextPageTable> = unknown extends NextPageTable[T]['params']
  ? [query?:QueryObjectOf<NextPageTable[T]['query']>]
  : [params:NextPageTable[T]['params'], query?:QueryObjectOf<NextPageTable[T]['query']>]
;