import { NextResponse } from "next/server";
import { NextTypedAPI } from "../src/index";
import type { WriteStream } from "fs";

type Test = { hello: number[], a: typeof process.env, b: WriteStream };
interface Test2{ foo: number };
export const GET:NextTypedAPI<{ body: Test }, Test2> = () => NextResponse.json({ foo: Math.random() });