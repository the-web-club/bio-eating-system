"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/input";
import { Status } from "@/components/ui/status";
import { authClient } from "@/lib/auth-client";

export function PrivacyControls({
  marketingOptIn,
  consentVersion,
  consentHealthDataAt,
}: {
  marketingOptIn: boolean;
  consentVersion: string | null;
  consentHealthDataAt: string | null;
}) {
  const router = useRouter();
  const [marketing, setMarketing] = useState(marketingOptIn);
  const [marketingBusy, setMarketingBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [eraseOpen, setEraseOpen] = useState(false);
  const [eraseConfirm, setEraseConfirm] = useState("");
  const [eraseBusy, setEraseBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function saveMarketing(next: boolean) {
    setMarketingBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/portal/account/marketing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingOptIn: next }),
      });
      if (res.status === 401) {
        router.push("/?next=/portal/account");
        return;
      }
      if (!res.ok) {
        setError("Marketing preference could not be saved. Try again.");
        return;
      }
      setMarketing(next);
      setNotice(
        next
          ? "Weekly shopping list emails are on."
          : "Weekly shopping list emails are off.",
      );
      router.refresh();
    } catch {
      setError("Network error. Try again when you are online.");
    } finally {
      setMarketingBusy(false);
    }
  }

  async function downloadExport() {
    setExportBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/portal/account/export");
      if (res.status === 401) {
        router.push("/?next=/portal/account");
        return;
      }
      if (!res.ok) {
        setError("Your data export could not be prepared. Try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "well-with-katarina-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("Export downloaded.");
    } catch {
      setError("Network error. Try again when you are online.");
    } finally {
      setExportBusy(false);
    }
  }

  async function eraseAccount() {
    if (eraseConfirm !== "DELETE") return;
    setEraseBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (res.status === 401) {
        router.push("/?next=/portal/account");
        return;
      }
      if (!res.ok) {
        setError("Account could not be deleted. Try again.");
        setEraseBusy(false);
        return;
      }
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Try again when you are online.");
      setEraseBusy(false);
    }
  }

  return (
    <div className="space-y-group">
      <div className="space-y-3">
        <Checkbox
          id="account-marketing"
          label="Send me the weekly shopping list by email."
          checked={marketing}
          disabled={marketingBusy}
          onCheckedChange={(checked) => {
            void saveMarketing(checked);
          }}
        />
        {consentVersion && consentHealthDataAt ? (
          <p className="text-small text-faint">
            Health data consent {consentVersion}, recorded{" "}
            {new Date(consentHealthDataAt).toLocaleDateString()}.
          </p>
        ) : (
          <p className="text-small text-faint">
            Health data consent is recorded when you create your plan.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="compact"
          loading={exportBusy}
          loadingLabel="Preparing…"
          onClick={() => {
            void downloadExport();
          }}
        >
          Download my data
        </Button>
        <Button
          variant="danger"
          size="compact"
          onClick={() => {
            setEraseConfirm("");
            setEraseOpen(true);
          }}
        >
          Delete account
        </Button>
      </div>

      {notice ? (
        <Status role="success" wash>
          {notice}
        </Status>
      ) : null}
      {error ? (
        <Status role="danger" wash>
          {error}
        </Status>
      ) : null}

      <Dialog
        open={eraseOpen}
        onOpenChange={setEraseOpen}
        title="Delete account"
        description="This permanently removes your plan, intake answers and account. Type DELETE to confirm."
        showClose={false}
        footer={
          <>
            <Button
              variant="secondary"
              size="compact"
              onClick={() => setEraseOpen(false)}
              disabled={eraseBusy}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="compact"
              loading={eraseBusy}
              loadingLabel="Deleting…"
              disabled={eraseConfirm !== "DELETE"}
              disabledReason="Type DELETE to enable this action"
              onClick={() => {
                void eraseAccount();
              }}
            >
              Delete account
            </Button>
          </>
        }
      >
        <TextField
          id="erase-confirm"
          label="Confirmation"
          name="erase-confirm"
          value={eraseConfirm}
          onChange={(e) => setEraseConfirm(e.target.value)}
          autoComplete="off"
        />
      </Dialog>
    </div>
  );
}
