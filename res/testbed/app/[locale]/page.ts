import { NextTypedPage } from "@daldalso/next-typed-route";
import { useSearchParams } from "next/navigation";

const Page:NextTypedPage<"/[locale]", "a"|"b?", { 'test': number }> = ({ test }) => {
  const searchParams = useSearchParams();

  return null;
};
export default Page;