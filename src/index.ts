import type { NextRequest, NextResponse } from "next/server.js";

type RequestObject = {
  'body': any
};
export type NextHandler<Req extends RequestObject = { 'body': never }, Res = never> = (
  req:Omit<NextRequest, 'json'>&{ json: () => Promise<Req['body']> },
  params:Record<string, string|string[]>
) => NextResponse<Res>|Promise<NextResponse<Res>>;

export type Endpoint<Req extends RequestObject, Res> = Res;
export interface NextRoutingTable{}
export default function callAPI<T extends keyof NextRoutingTable>(path:T):Promise<NextRoutingTable[T]>{
  // TODO
  console.log("callAPI", path);
  return {} as any;
}