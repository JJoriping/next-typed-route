import type { Endpoint, emptyParamSymbol } from "@daldalso/next-typed-route";
type Req = {
  'body': {
    'foo': string,
    'bar'?: number
  }
};
type Res = {
  'result': string|null
};
declare module "@daldalso/next-typed-route"{
  export interface NextEndpointTable{
    'POST /api/dummy':Endpoint<Req, Res>;
    'GET /api/dummy/[id]':Endpoint<{ 'query': "page?"|"foo?" }&{ params: { 'id': string|typeof emptyParamSymbol } }, string>;
  }
}