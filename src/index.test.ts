import test from "node:test";
import callAPI from "./index.js";

declare module "./index.js"{
  interface NextRoutingTable{
    'GET /[slug]/test':Endpoint<{ query: "r1"|"r2[]"|"r3[]"|"o1?"|"o2?" }&{ params: {'slug': string} }, void>;
  }
}
test("callAPI()", async () => {
  await callAPI('GET /[slug]/test', {
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