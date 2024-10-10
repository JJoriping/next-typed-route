import type { NextTypedPage, TypedURLSearchParams } from "@daldalso/next-typed-route";

declare module "next/navigation"{
  export function useSearchParams<T>():T extends NextTypedPage<any, infer R extends string, any> ? TypedURLSearchParams<R> : unknown;
}