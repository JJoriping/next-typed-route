import assert from "node:assert";
import test from "node:test";
import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";
import type { NextTypedRoute } from "./index.js";
import { callRawAPI, emptyParamSymbol as emptyParameterSymbol, page } from "./index.js";

declare const typeCastTest:NextTypedRoute;
const typeTest:NextTypedRoute<{
  'body': string
}> = async req => {
  const x = await req.json();

  console.log(Date.parse(x));

  return new NextResponse();
};
console.log(
  typeTest,
  typeCastTest as (req:NextRequest, { params }:{ 'params': Record<string, string|string[]> }) => Promise<NextResponse>
);

// declare module "./index.js"{
//   interface NextEndpointTable{
//     'GET /[slug]/test':Endpoint<{ 'query': "r1"|"r2[]"|"r3[]"|"o1?"|"o2?" }&{ 'params': {'slug': string} }, void>;
//   }
//   interface NextPageTable{
//     '/foo':{ 'query': "foo[]" };
//   }
// }
test("callRawAPI()", async t => {
  t.mock.method(global, "fetch", ((input, init) => {
    assert(input instanceof URL);
    assert.strictEqual(input.href, 'http://localhost/123/test?r1=1&r3=2&r3=3&o1=4');
    assert.strictEqual(init?.method, 'GET');
    return Promise.resolve(new Response());
  }) as typeof fetch);

  // @ts-expect-error
  await callRawAPI("GET /[slug]/test", {
    params: { slug: "123" },
    query: {
      r1: "1",
      r2: [],
      r3: [ "2", "3" ],
      o1: "4",
      foo: undefined
    },
    options: {
      host: "http://localhost"
    }
  });
});
test("page()", () => {
  // @ts-expect-error
  assert.strictEqual(page("/foo", { foo: [ "1", "2" ] }), '/foo?foo=1&foo=2');
  // @ts-expect-error
  assert.strictEqual(page("/foo/[slug]", { slug: "bar" }, {}), '/foo/bar');
  // @ts-expect-error
  assert.strictEqual(page("/foo/[slug]", { slug: emptyParameterSymbol }), '/foo');
  // @ts-expect-error
  assert.strictEqual(page("/foo/[...slug]/2", { slug: [] }, { foo: "1", bar: "2" }), '/foo/(missing slug)/2?foo=1&bar=2');
  // @ts-expect-error
  assert.strictEqual(page("/foo/[[...slug]]/3", {}, {}), '/foo/3');
});