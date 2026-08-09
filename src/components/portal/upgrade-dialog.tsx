"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UpgradeDialog({
  open,
  onOpenChange,
  title,
  value,
  includes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  includes: string[];
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={value}
      showClose={false}
    >
      <ul className="mt-2 list-disc space-y-1 pl-5 text-body text-foreground">
        {includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-4 text-small text-muted">
        Upgrades are completed on the website. Access appears here after purchase
        confirmation.
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button
          onClick={() => {
            window.open(process.env.NEXT_PUBLIC_APP_URL ?? "/", "_blank", "noopener,noreferrer");
          }}
        >
          View plans
        </Button>
      </div>
    </Dialog>
  );
}
