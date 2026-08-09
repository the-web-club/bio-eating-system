"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Status } from "@/components/ui/status";
import {
  ALLERGEN_LABELS,
  ACTIVITY_LABELS,
  GOAL_LABELS,
  SCREENING_LABELS,
  SCREENING_REASON_COPY,
  SLOT_LABELS,
} from "@/lib/content/labels";
import {
  defaultIntakeDraft,
  type IntakeDraft,
} from "@/lib/intake/schema";
import { ALLERGENS, FOOD_SLOTS } from "@/lib/nutrition/plan-engine";
import { SCREENING_FLAGS } from "@/lib/nutrition/screening";
import { wizardSlideVariants } from "@/lib/motion";
import { MeasurementInput } from "./measurement-input";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingShell } from "./onboarding-shell";
import { OptionCard } from "./option-card";
import { ReviewGroup } from "./review-group";

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "personal", label: "Personal details" },
  { id: "body", label: "Body measurements" },
  { id: "goal", label: "Primary goal" },
  { id: "allergens", label: "Allergies to exclude" },
  { id: "swaps", label: "Foods to replace" },
  { id: "prefs", label: "Units and activity" },
  { id: "screening", label: "Health context" },
  { id: "review", label: "Review" },
  { id: "done", label: "Complete" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function IntakeWizard({ initialName }: { initialName?: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<IntakeDraft>(() => ({
    ...defaultIntakeDraft(),
    displayName: initialName ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resultNotice, setResultNotice] = useState<string[] | null>(null);
  const submitted = useRef(false);
  const headingId = useId();
  const step = STEPS[stepIndex];
  const variants = wizardSlideVariants(!!reduceMotion);

  useEffect(() => {
    document.getElementById(headingId)?.focus();
  }, [stepIndex, headingId]);

  function patch(partial: Partial<IntakeDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function validate(current: StepId): boolean {
    const next: Record<string, string> = {};
    if (current === "personal") {
      if (!draft.displayName.trim()) next.displayName = "Enter your name.";
      if (draft.age < 16 || draft.age > 100) next.age = "Enter an age between 16 and 100.";
    }
    if (current === "body") {
      if (draft.heightCm < 120 || draft.heightCm > 230)
        next.heightCm = "Enter height between 120 and 230 cm.";
      if (draft.weightKg < 35 || draft.weightKg > 300)
        next.weightKg = "Enter weight between 35 and 300 kg.";
    }
    if (current === "review" && !draft.consentHealthData) {
      next.consent = "Consent is required to create your plan.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validate(step.id)) return;
    if (step.id === "review") {
      void submit();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setSubmitError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    if (submitted.current || submitting) return;
    if (!validate("review")) return;
    submitted.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setStepIndex(STEPS.findIndex((s) => s.id === "done"));

    const payload = {
      age: draft.age,
      heightCm: draft.heightCm,
      weightKg: draft.weightKg,
      sex: draft.sex,
      goal: draft.goal,
      unitSystem: draft.unitSystem,
      activityLevel: draft.activityLevel,
      declaredAllergens: draft.declaredAllergens,
      excludedSlots: draft.excludedSlots,
      swapRequests: draft.swapRequests,
      screeningFlags: draft.screeningFlags,
      notesForCoach: draft.notesForCoach || undefined,
      consentHealthData: true as const,
    };

    try {
      const res = await fetch("/api/portal/biometrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        outcome?: string;
        reasonCodes?: string[];
      };

      if (res.status === 401) {
        router.push("/sign-in?next=/portal/intake");
        return;
      }
      if (res.status === 403) {
        setSubmitError("Your account does not include the core plan yet.");
        submitted.current = false;
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        setSubmitError("The plan could not be created. Check your answers and try again.");
        submitted.current = false;
        setSubmitting(false);
        return;
      }

      if (data.outcome === "refused") {
        setResultNotice(
          (data.reasonCodes ?? []).map(
            (code) => SCREENING_REASON_COPY[code] ?? "A plan could not be generated.",
          ),
        );
        setSubmitting(false);
        return;
      }

      setResultNotice(
        (data.reasonCodes ?? []).map(
          (code) => SCREENING_REASON_COPY[code] ?? code,
        ),
      );
      setSubmitting(false);
      router.push("/portal");
      router.refresh();
    } catch {
      setSubmitError("Network error. Try again when you are online.");
      submitted.current = false;
      setSubmitting(false);
    }
  }

  return (
    <OnboardingShell
      footer={
        step.id !== "done" && step.id !== "welcome" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="quiet" onClick={goBack} disabled={stepIndex === 0}>
              Back
            </Button>
            <Button
              onClick={goNext}
              loading={submitting}
              disabled={submitting}
            >
              {step.id === "review" ? "Create plan" : "Continue"}
            </Button>
          </div>
        ) : null
      }
    >
      {step.id !== "welcome" && step.id !== "done" ? (
        <OnboardingProgress
          step={stepIndex}
          total={STEPS.length - 1}
          label={step.label}
        />
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: variants.transition.duration,
            ease: variants.transition.ease as "linear" | [number, number, number, number],
          }}
        >
          <h2
            id={headingId}
            tabIndex={-1}
            className="text-display text-foreground outline-none"
          >
            {headingFor(step.id)}
          </h2>
          <p className="mt-2 measure text-lead text-muted">{whyFor(step.id)}</p>

          <div className="mt-group space-y-tight">
            {step.id === "welcome" ? (
              <>
                <Status role="neutral">
                  You will answer a few questions about your body, goals, and foods to
                  avoid. Health data stays in your account and is used only to build your
                  plan.
                </Status>
                <Button onClick={goNext}>Start</Button>
              </>
            ) : null}

            {step.id === "personal" ? (
              <fieldset className="space-y-4">
                <legend className="sr-only">Personal details</legend>
                <MeasurementInput
                  label="Name"
                  name="displayName"
                  value={draft.displayName}
                  onChange={(e) => patch({ displayName: e.target.value })}
                  error={errors.displayName}
                  autoComplete="name"
                />
                <MeasurementInput
                  label="Age in years"
                  name="age"
                  type="number"
                  inputMode="numeric"
                  value={draft.age}
                  onChange={(e) => patch({ age: Number(e.target.value) })}
                  error={errors.age}
                />
                <div className="space-y-2">
                  <p className="text-body text-foreground">Sex used for energy estimate</p>
                  <OptionCard
                    name="sex"
                    value="female"
                    title="Female"
                    selected={draft.sex === "female"}
                    onSelect={() => patch({ sex: "female" })}
                  />
                  <OptionCard
                    name="sex"
                    value="male"
                    title="Male"
                    selected={draft.sex === "male"}
                    onSelect={() => patch({ sex: "male" })}
                  />
                </div>
              </fieldset>
            ) : null}

            {step.id === "body" ? (
              <fieldset className="space-y-4">
                <legend className="sr-only">Body measurements</legend>
                <MeasurementInput
                  label="Height (cm)"
                  name="heightCm"
                  type="number"
                  inputMode="decimal"
                  value={draft.heightCm}
                  onChange={(e) => patch({ heightCm: Number(e.target.value) })}
                  error={errors.heightCm}
                  hint="Used for energy estimation. Stored as health data."
                />
                <MeasurementInput
                  label="Weight (kg)"
                  name="weightKg"
                  type="number"
                  inputMode="decimal"
                  value={draft.weightKg}
                  onChange={(e) => patch({ weightKg: Number(e.target.value) })}
                  error={errors.weightKg}
                />
              </fieldset>
            ) : null}

            {step.id === "goal" ? (
              <fieldset className="space-y-2">
                <legend className="sr-only">Primary goal</legend>
                {(Object.keys(GOAL_LABELS) as Array<keyof typeof GOAL_LABELS>).map(
                  (goal) => (
                    <OptionCard
                      key={goal}
                      name="goal"
                      value={goal}
                      title={GOAL_LABELS[goal]}
                      selected={draft.goal === goal}
                      onSelect={() => patch({ goal })}
                    />
                  ),
                )}
              </fieldset>
            ) : null}

            {step.id === "allergens" ? (
              <fieldset className="space-y-3">
                <legend className="text-body text-foreground">
                  Allergies and foods to exclude completely
                </legend>
                <p className="text-small text-muted">
                  These remove foods from your plan entirely. Preference swaps are on the
                  next step.
                </p>
                {ALLERGENS.map((allergen) => (
                  <Checkbox
                    key={allergen}
                    id={`allergen-${allergen}`}
                    label={ALLERGEN_LABELS[allergen]}
                    checked={draft.declaredAllergens.includes(allergen)}
                    onCheckedChange={() =>
                      patch({
                        declaredAllergens: toggleIn(draft.declaredAllergens, allergen),
                      })
                    }
                  />
                ))}
              </fieldset>
            ) : null}

            {step.id === "swaps" ? (
              <fieldset className="space-y-3">
                <legend className="text-body text-foreground">
                  Foods you would prefer to replace
                </legend>
                <p className="text-small text-muted">
                  These find alternatives where possible. They are not the same as
                  allergies.
                </p>
                {FOOD_SLOTS.map((slot) => (
                  <Checkbox
                    key={slot}
                    id={`swap-${slot}`}
                    label={SLOT_LABELS[slot]}
                    checked={draft.swapRequests.includes(slot)}
                    onCheckedChange={() =>
                      patch({
                        swapRequests: toggleIn(draft.swapRequests, slot),
                      })
                    }
                  />
                ))}
              </fieldset>
            ) : null}

            {step.id === "prefs" ? (
              <fieldset className="space-y-4">
                <legend className="sr-only">Units and activity</legend>
                <div className="space-y-2">
                  <p className="text-body text-foreground">Portion units</p>
                  <OptionCard
                    name="unit"
                    value="HOUSEHOLD"
                    title="Household portions"
                    description="Cups, pieces, and similar everyday measures."
                    selected={draft.unitSystem === "HOUSEHOLD"}
                    onSelect={() => patch({ unitSystem: "HOUSEHOLD" })}
                  />
                  <OptionCard
                    name="unit"
                    value="METRIC"
                    title="Grams"
                    selected={draft.unitSystem === "METRIC"}
                    onSelect={() => patch({ unitSystem: "METRIC" })}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-body text-foreground">Usual activity</p>
                  {(
                    Object.keys(ACTIVITY_LABELS) as Array<keyof typeof ACTIVITY_LABELS>
                  ).map((level) => (
                    <OptionCard
                      key={level}
                      name="activity"
                      value={level}
                      title={ACTIVITY_LABELS[level]}
                      selected={draft.activityLevel === level}
                      onSelect={() => patch({ activityLevel: level })}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step.id === "screening" ? (
              <fieldset className="space-y-3">
                <legend className="text-body text-foreground">
                  Anything we should account for
                </legend>
                <p className="text-small text-muted">
                  Some answers mean the product will keep you at maintenance energy
                  rather than a deficit. That is a safety decision, not an error.
                </p>
                {SCREENING_FLAGS.map((flag) => (
                  <Checkbox
                    key={flag}
                    id={`flag-${flag}`}
                    label={SCREENING_LABELS[flag]}
                    checked={draft.screeningFlags.includes(flag)}
                    onCheckedChange={() =>
                      patch({
                        screeningFlags: toggleIn(draft.screeningFlags, flag),
                      })
                    }
                  />
                ))}
                <MeasurementInput
                  label="Notes for your coach (optional)"
                  name="notes"
                  value={draft.notesForCoach ?? ""}
                  onChange={(e) => patch({ notesForCoach: e.target.value })}
                  hint="Stored for a human reviewer. Never used to decide your foods automatically."
                />
              </fieldset>
            ) : null}

            {step.id === "review" ? (
              <div className="space-y-tight">
                <div className="border-t border-hairline">
                <ReviewGroup title="Personal" onEdit={() => setStepIndex(1)}>
                  <p>
                    {draft.displayName}, age {draft.age}, {draft.sex}
                  </p>
                </ReviewGroup>
                <ReviewGroup title="Body" onEdit={() => setStepIndex(2)}>
                  <p>
                    {draft.heightCm} cm · {draft.weightKg} kg
                  </p>
                </ReviewGroup>
                <ReviewGroup title="Goal" onEdit={() => setStepIndex(3)}>
                  <p>{GOAL_LABELS[draft.goal]}</p>
                </ReviewGroup>
                <ReviewGroup title="Exclusions" onEdit={() => setStepIndex(4)}>
                  <p>
                    {draft.declaredAllergens.length
                      ? draft.declaredAllergens.map((a) => ALLERGEN_LABELS[a]).join(", ")
                      : "None"}
                  </p>
                </ReviewGroup>
                <ReviewGroup title="Replacements" onEdit={() => setStepIndex(5)}>
                  <p>
                    {draft.swapRequests.length
                      ? draft.swapRequests.map((s) => SLOT_LABELS[s]).join(", ")
                      : "None"}
                  </p>
                </ReviewGroup>
                </div>
                <Checkbox
                  id="consent"
                  label="I consent to processing of my health data to create my plan."
                  checked={draft.consentHealthData}
                  onCheckedChange={(checked) =>
                    patch({ consentHealthData: checked })
                  }
                />
                {errors.consent ? (
                  <p className="text-small text-status-danger-text">{errors.consent}</p>
                ) : null}
                {submitError ? (
                  <Status role="danger" wash>
                    {submitError}{" "}
                    <button
                      type="button"
                      className="cursor-[var(--cursor-control)] rounded-control underline underline-offset-4"
                      onClick={() => {
                        submitted.current = false;
                        void submit();
                      }}
                    >
                      Try again
                    </button>
                  </Status>
                ) : null}
              </div>
            ) : null}

            {step.id === "done" ? (
              <div className="space-y-tight">
                {submitting ? (
                  <Status role="neutral">Creating your plan…</Status>
                ) : null}
                {submitError ? (
                  <Status role="danger" wash>
                    {submitError}{" "}
                    <button
                      type="button"
                      className="cursor-[var(--cursor-control)] rounded-control underline underline-offset-4"
                      onClick={() => {
                        submitted.current = false;
                        setStepIndex(STEPS.findIndex((s) => s.id === "review"));
                      }}
                    >
                      Back to review
                    </button>
                  </Status>
                ) : null}
                {resultNotice?.length ? (
                  <Status role="neutral">
                    <ul className="space-y-2">
                      {resultNotice.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </Status>
                ) : null}
                {!submitting && !submitError ? (
                  <Button onClick={() => router.push("/portal")}>Open today</Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </OnboardingShell>
  );
}

function headingFor(id: StepId): string {
  switch (id) {
    case "welcome":
      return "Let’s build your plan";
    case "personal":
      return "Personal details";
    case "body":
      return "Body measurements";
    case "goal":
      return "What are you aiming for?";
    case "allergens":
      return "Allergies and foods to exclude";
    case "swaps":
      return "Foods you would prefer to replace";
    case "prefs":
      return "Units and usual activity";
    case "screening":
      return "Health context";
    case "review":
      return "Review your profile";
    case "done":
      return "Almost there";
  }
}

function whyFor(id: StepId): string {
  switch (id) {
    case "welcome":
      return "About ten minutes. You can go back and edit before your plan is created.";
    case "personal":
      return "Age and sex inform the energy estimate. Your name is for greeting only.";
    case "body":
      return "Height and weight are health data. They are required for a personalised plan.";
    case "goal":
      return "Your goal guides energy targets, within safety limits.";
    case "allergens":
      return "Declared allergens remove matching foods completely.";
    case "swaps":
      return "Optional replacements when you simply prefer something else.";
    case "prefs":
      return "Choose how portions are shown and how active you usually are.";
    case "screening":
      return "These answers decide whether a deficit is allowed at all.";
    case "review":
      return "Check everything once. You can edit any group before creating the plan.";
    case "done":
      return "We are generating your plan from your answers.";
  }
}
