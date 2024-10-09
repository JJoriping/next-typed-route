import type { NextEndpointTable } from "./index.js";

export type DefaultRequestObject = {
  'query': never,
  'body': never
};
export type CallAPIOptions = Omit<RequestInit, 'method'|'body'>&{
  'host'?: string
};
export type RequestArgumentsOf<T extends keyof NextEndpointTable> = unknown extends NextEndpointTable[T]['req']
  ? [requestObject?:{ 'options': CallAPIOptions }]
  : [
    requestObject:{
      [key in keyof NextEndpointTable[T]['req'] as unknown extends NextEndpointTable[T]['req'][key] ? never : key]: key extends "query"
          ? QueryObjectOf<NextEndpointTable[T]['req'][key]>
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