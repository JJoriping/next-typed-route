import type { NextEndpointTable, NextPageTable } from "./index.js";

export type DefaultRequestObject = {
  'query': never,
  'body': never
};
export type CallAPIOptions = Omit<RequestInit, 'method'|'body'>&{
  'host'?: string
};
export type CallAPIArgumentsOf<T extends keyof NextEndpointTable> = unknown extends NextEndpointTable[T]['req']
  ? [requestObject?:{ 'options': CallAPIOptions }]
  : [
    requestObject:{
      [key in keyof NextEndpointTable[T]['req'] as unknown extends NextEndpointTable[T]['req'][key] ? never : key]: key extends "query"
          ? QueryObjectOf<NextEndpointTable[T]['req'][key]>
          : NextEndpointTable[T]['req'][key]
    }&{ 'options'?: CallAPIOptions }
  ]
;
type QueryObjectOf<T extends string> = {
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