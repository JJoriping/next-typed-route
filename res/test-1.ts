import { NextResponse } from "next/server";
import { NextTypedRoute } from "../src/index";

type TestRequest = "r1"|"r2[]"|"r3[]"|"o1?"|"o2?";
interface TestResponse{ foo: number };
export const GET:NextTypedRoute<{ query: TestRequest }, TestResponse> = req => {
  return NextResponse.json({ foo: Math.random() });
};
export const POST:NextTypedRoute<{ body: number }, { result: boolean }> = req => {
  return NextResponse.json({ result: true });
};