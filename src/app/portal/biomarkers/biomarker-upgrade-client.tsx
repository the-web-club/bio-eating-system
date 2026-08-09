"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/components/portal/upgrade-dialog";

export function BiomarkerUpgradeClient() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        What is included
      </Button>
      <UpgradeDialog
        open={open}
        onOpenChange={setOpen}
        title="Lab reference"
        value="Read-only educational material about common biomarkers."
        includes={[
          "Marker explanations from the content catalogue",
          "Reference context without pass/fail scoring",
          "Professional consultation notice on every view",
        ]}
      />
    </>
  );
}
