import { pageLoadingFromCopy } from "@/components/portal/skeleton";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";

export default function ProgressLoading() {
  return pageLoadingFromCopy(PORTAL_PAGE_COPY.progress);
}
