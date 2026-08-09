"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/components/portal/upgrade-dialog";

export function WeeklyUpgradeClient() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        What is included
      </Button>
      <UpgradeDialog
        open={open}
        onOpenChange={setOpen}
        title="Weekly rotation"
        value="A rotating grocery list matched to your plan, emailed weekly when active."
        includes={[
          "Current authored week varieties",
          "Quantities joined to your daily plan",
          "Email drop when your schedule is active",
        ]}
      />
    </>
  );
}
