import test from "node:test";
import { callRawAPI } from "./index.js";
import assert from "node:assert";

declare module "./index.js"{
  interface NextRoutingTable{
    'GET /[slug]/test':Endpoint<{ query: "r1"|"r2[]"|"r3[]"|"o1?"|"o2?" }&{ params: {'slug': string} }, void>;
  }
}
test("callRawAPI()", async t => {
  t.mock.method(global, 'fetch', ((input, init) => {
    assert(input instanceof URL);
    assert.strictEqual(input.href, "http://localhost/123/test?r1=1&r3=2&r3=3&o1=4");
    assert.strictEqual(init?.method, "GET");
    return Promise.resolve(new Response());
  }) as typeof fetch);

  await callRawAPI('GET /[slug]/test', {
    params: { slug: "123" },
    query: {
      r1: "1",
      r2: [],
      r3: [ "2", "3" ],
      o1: "4"
    },
    options: {
      host: "http://localhost"
    }
  });
});