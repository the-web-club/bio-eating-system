import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ReviewGroup({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: ReactNode;
  onEdit: () => void;
}) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-hairline py-3">
      <div className="min-w-0">
        <h3 className="text-body-lg font-semibold text-foreground">{title}</h3>
        <div className="mt-0.5 space-y-0.5 text-body text-muted">{children}</div>
      </div>
      <Button variant="quiet" size="compact" onClick={onEdit}>
        Edit
      </Button>
    </section>
  );
}
