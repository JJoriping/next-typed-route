import { NextTypedPage } from "@daldalso/next-typed-route";
import { useSearchParams } from "next/navigation";

const Page:NextTypedPage<"/[locale]"> = ({ params }) => {
  const searchParams = useSearchParams();

  return null;
};
export default Page;