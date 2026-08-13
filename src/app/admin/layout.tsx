import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage("/admin");

  return (
    <AdminShell title="Staff" staffEmail={admin.email}>
      {children}
    </AdminShell>
  );
}
