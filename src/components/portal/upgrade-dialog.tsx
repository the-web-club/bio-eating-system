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
      footer={
        <>
          <Button variant="secondary" size="compact" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            size="compact"
            onClick={() => {
              window.open(
                process.env.NEXT_PUBLIC_APP_URL ?? "/",
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            View plans
          </Button>
        </>
      }
    >
      <ul className="space-y-s4">
        {includes.map((item) => (
          <li key={item} className="text-body text-foreground">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-s5 text-meta text-muted">
        Upgrades are completed on the website. Access appears here after purchase
        confirmation.
      </p>
    </Dialog>
  );
}
