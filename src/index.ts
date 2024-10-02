import type { NextRequest, NextResponse } from "next/server.js";

type RequestObject = {
  'body': any
};
type DefaultRequestObject = {
  'body': never
};
export type NextTypedAPI<Req extends RequestObject = DefaultRequestObject, Res = never> = (
  req:Omit<NextRequest, 'json'>&{ json: () => Promise<Req['body']> },
  // eslint-disable-next-line unicorn/prevent-abbreviations
  params:Record<string, string|string[]>
) => NextResponse<Res>|Promise<NextResponse<Res>>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NextRoutingTable{}
export type Endpoint<Req extends RequestObject, Res, P> = { 'req': Req&{ 'params': P }, 'res': Res };
export default function callAPI<T extends keyof NextRoutingTable>(path:T, ...args:RequestArgumentsOf<T>):Promise<NextRoutingTable[T]['res']>{
  // TODO
  console.log("callAPI", path);
  return {} as any;
}

type RequestArgumentsOf<T extends keyof NextRoutingTable> = NextRoutingTable[T]['req'] extends DefaultRequestObject
  ? []
  : [requestObject:{
    [key in keyof NextRoutingTable[T]['req'] as NextRoutingTable[T]['req'][key] extends never ? never : key]: NextRoutingTable[T]['req'][key]
  }]
;