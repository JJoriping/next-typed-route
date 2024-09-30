import type { NextRequest, NextResponse } from "next/server.js";

export type NextHandler<T = unknown> = (req:NextRequest, params:Record<string, string|string[]>) => NextResponse<T>|Promise<NextResponse<T>>;
export default function callAPI(path:string):void{
  // TODO
  console.log("callAPI", path);
}