import { pageLoadingFromCopy } from "@/components/portal/skeleton";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";

export default function PortalLoading() {
  return pageLoadingFromCopy(PORTAL_PAGE_COPY.today);
}
