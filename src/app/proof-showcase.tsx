"use client";

import { useId, useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  Combobox,
  CommandMenu,
  CommandMenuHint,
  DataList,
  Dialog,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  EmptyState,
  InsetPanel,
  Panel,
  Popover,
  RadioGroup,
  Select,
  Status,
  Tabs,
  TextField,
  Tooltip,
  WizardSlideDemo,
  useToast,
} from "@/components/ui";

export function ProofShowcase() {
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("a");
  const [comboValue, setComboValue] = useState("one");
  const [radio, setRadio] = useState("a");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [greyscale, setGreyscale] = useState(false);
  const [slowNetwork, setSlowNetwork] = useState(false);
  const [forceReduced, setForceReduced] = useState(false);
  const headingId = useId();

  async function runLoading() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, slowNetwork ? 1200 : 200));
    setLoading(false);
    toast.push("Saved", "neutral");
  }

  return (
    <div
      className={
        [greyscale && "greyscale", forceReduced && "force-reduced-motion"]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      <section className="space-y-tight" aria-labelledby="playground-controls">
        <h2 id="playground-controls" className="text-section text-foreground">
          Playground controls
        </h2>
        <InsetPanel>
          <CheckboxGroup layout="wrap">
            <Checkbox
              id="toggle-greyscale"
              label="Greyscale"
              checked={greyscale}
              onCheckedChange={setGreyscale}
            />
            <Checkbox
              id="toggle-reduced"
              label="Force reduced motion"
              checked={forceReduced}
              onCheckedChange={setForceReduced}
            />
            <Checkbox
              id="toggle-slow"
              label="Slow network"
              checked={slowNetwork}
              onCheckedChange={setSlowNetwork}
            />
          </CheckboxGroup>
        </InsetPanel>
        <CommandMenuHint />
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-section text-foreground">
          Status roles
        </h2>
        <div className="space-y-3">
          <Status role="neutral">
            Screening note, the product will not generate a deficit for this profile.
            Neutral mark, no wash, not an error.
          </Status>
          <Status role="info">Something to notice. Accent mark only.</Status>
          <Status role="success">Persistent confirmed state. Mark only is green.</Status>
          <Status role="danger" wash>
            Blocking validation failure. Wash allowed only here.
          </Status>
        </div>
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="buttons-heading">
        <h2 id="buttons-heading" className="text-section text-foreground">
          Buttons
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => toast.push("Primary action", "neutral")}>
            Primary
          </Button>
          <Button variant="confirm">Confirm</Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            Delete…
          </Button>
          <Button variant="quiet">Back</Button>
          <Button size="compact">Compact</Button>
          <Button disabled disabledReason="Complete the previous step first">
            Disabled
          </Button>
          <Button loading={loading} onClick={runLoading}>
            Save
          </Button>
          <Tooltip content="Opens the sample dialog">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
          </Tooltip>
        </div>
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="menus-heading">
        <h2 id="menus-heading" className="text-section text-foreground">
          Select, menu, combobox
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Select"
            value={selectValue}
            onValueChange={setSelectValue}
            options={[
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
              { value: "c", label: "120" },
              { value: "d", label: "45" },
            ]}
          />
          <Combobox
            label="Combobox"
            value={comboValue}
            onValueChange={setComboValue}
            options={[
              { value: "one", label: "Item one" },
              { value: "two", label: "Item two" },
              { value: "three", label: "Item three" },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <DropdownMenu trigger={<Button variant="secondary">Open menu</Button>}>
            <DropdownMenuItem shortcut="⌘K" onSelect={() => setCommandOpen(true)}>
              Command menu
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast.push("Copied", "neutral")}>
              Copy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
              Delete…
            </DropdownMenuItem>
          </DropdownMenu>
          <Popover trigger={<Button variant="quiet">Open popover</Button>}>
            <p className="text-body text-foreground">Popover content.</p>
          </Popover>
        </div>
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="input-heading">
        <h2 id="input-heading" className="text-section text-foreground">
          Fields
        </h2>
        <div className="max-w-md space-y-4">
          <TextField label="Email" name="email" type="email" autoComplete="email" />
          <TextField
            label="Age in years"
            labelledBy={headingId}
            name="age"
            type="number"
            align="center"
            inputMode="numeric"
            error="Enter a whole number."
          />
          <h3 id={headingId} className="sr-only">
            Your age
          </h3>
          <CheckboxGroup className="border-t border-hairline pt-tight">
            <Checkbox
              id="opt-in"
              label="Optional preference"
              checked={checked}
              onCheckedChange={setChecked}
            />
            <RadioGroup
              label="Choice"
              value={radio}
              onValueChange={setRadio}
              options={[
                { value: "a", label: "Choice A" },
                { value: "b", label: "Choice B" },
              ]}
            />
          </CheckboxGroup>
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Sample dialog"
        description="Focus stays inside until you close. Escape restores focus to the trigger."
      >
        Dialog body.
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm delete"
        description="Filled danger appears only on the final confirmation step."
        showClose={false}
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmOpen(false);
              toast.push("Deleted", "neutral");
            }}
          >
            Delete
          </Button>
        </div>
      </Dialog>

      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        items={[
          {
            id: "nav-plan",
            label: "Go to daily plan",
            group: "Navigate",
            shortcut: "G P",
            onSelect: () => toast.push("Navigate: daily plan", "info"),
          },
          {
            id: "nav-week",
            label: "Go to weekly plan",
            group: "Navigate",
            onSelect: () => toast.push("Navigate: weekly plan", "info"),
          },
          {
            id: "act-save",
            label: "Save",
            group: "Actions",
            shortcut: "⌘S",
            onSelect: () => toast.push("Saved", "neutral"),
          },
        ]}
      />

      <section className="mt-section space-y-tight" aria-labelledby="panels-heading">
        <h2 id="panels-heading" className="text-section text-foreground">
          Panels
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Panel>
            <h3 className="text-title text-foreground">Interactive object</h3>
            <p className="mt-1.5 text-body text-muted">
              Elevation level 2: one hairline border, no shadow.
            </p>
          </Panel>
          <InsetPanel>
            <h3 className="text-title text-foreground">Inset surface</h3>
            <p className="mt-1.5 text-body text-muted">
              Elevation level 1: a surface shift only, for selected or actionable
              content.
            </p>
          </InsetPanel>
        </div>
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="tabs-heading">
        <h2 id="tabs-heading" className="text-section text-foreground">
          Tabs
        </h2>
        <Tabs
          items={[
            { id: "plan", label: "Daily plan", panel: "Panel one." },
            { id: "list", label: "Weekly plan", panel: "Panel two." },
            { id: "account", label: "Account", panel: "Panel three." },
          ]}
        />
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="list-heading">
        <h2 id="list-heading" className="text-section text-foreground">
          Data list
        </h2>
        <DataList
          caption="Sample values"
          rows={[
            { label: "Item one", value: "120" },
            { label: "Item two", value: "45" },
            { label: "Item three", value: "8" },
          ]}
        />
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="badge-heading">
        <h2 id="badge-heading" className="text-section text-foreground">
          Badges
        </h2>
        <p className="measure text-body text-muted">
          Reserved for genuinely small state indicators. Not shown on every module.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge>New</Badge>
          <Badge>Week 1</Badge>
        </div>
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="empty-heading">
        <h2 id="empty-heading" className="text-section text-foreground">
          Empty state
        </h2>
        <EmptyState eyebrow="Empty" title="Nothing here yet">
          Complete the next step and this section fills in.
        </EmptyState>
      </section>

      <section className="mt-section space-y-tight" aria-labelledby="wizard-heading">
        <h2 id="wizard-heading" className="text-section text-foreground">
          Wizard slide
        </h2>
        <WizardSlideDemo />
      </section>
    </div>
  );
}
