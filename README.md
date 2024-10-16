# @daldalso/next-typed-route
Type-safe API call and routing library for Next.js

## Getting Started
1. `yarn add @daldalso/next-typed-route`
2. Open your Next.js config file and add `NextTypedRoutePlugin` like below:
   ```js
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      webpack: (config, context) => {
        if(context.isServer){
          config.plugins ??= [];
          config.plugins.push(new NextTypedRoutePlugin());
        }
        return config;
      }
    };
   ```
3. `yarn dev` will run the plugin and make some type definitions.

## Usage
### Typed Page
Mark your page components with `NextTypedPage` for type-safe routing.
```tsx
import { NextTypedPage } from "@daldalso/next-typed-route";

const MyPage:NextTypedPage<"/my-page/[foo]"> = ({ params }) => {
  return <div>Hello, {params.foo}!</div>; // Type-safe access to `params.foo`
};
export default Page;
```

### Typed Route
Mark your API routes with `NextTypedRoute` for type-safe routing.
```ts
import type { NextTypedRoute } from "@daldalso/next-typed-route";
import { NextResponse } from "next/server";

export const GET:NextTypedRoute = () => new NextResponse();
```

### Typed Search Parameters
You can use type-safe `useSearchParams` with a `NextTypedPage`.
```tsx
import { NextTypedPage } from "@daldalso/next-typed-route";
import { useSearchParams } from "next/navigation";

const Page:NextTypedPage<"/", "foo"|"bar?"|"baz[]"> = () => {
  const searchParams = useSearchParams<typeof Page>();

  return <>
    {/* Fine */}
    {searchParams.get("foo").toString()}
    {/* This raises a type error. */}
    {searchParams.get("baar")}
    {/* This raises a type error; you should use `getAll` for an array. */}
    {searchParams.get("baz")}
  </>;
};
export default Page;
```

### Typed Path Generation
You can use type-safe `page` function that returns a path string starting with `/`.
```tsx
import { NextTypedPage, page } from "@daldalso/next-typed-route";
import { useRouter } from "next/navigation";

const Page:NextTypedPage<"/", "foo"|"bar?"> = ({ params }) => {
  const router = useRouter();

  return <button onClick={() => router.push(page("/shop"))}>
    Shop
  </button>;
};
export default Page;
```

### Typed API Call
You can call your endpoints with type-safe `callAPI` function.
The types of its parameters and return value are defined by the endpoint.
```tsx
import callAPI, { NextTypedPage } from "@daldalso/next-typed-route";

const Page:NextTypedPage<"/"> = ({ params }) => {
  return <button onClick={() => callAPI("/api/foo")}>
    Submit
  </button>;
};
export default Page;
```