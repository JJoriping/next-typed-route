import { NextPageTable } from "@daldalso/next-typed-route";
import { TypedURLSearchParams } from "@daldalso/next-typed-route";

declare module "next/navigation"{
  export function useSearchParams<T extends keyof NextPageTable>():NextPageTable[T] extends { 'query': infer R extends string } ? TypedURLSearchParams<R> : unknown;
}