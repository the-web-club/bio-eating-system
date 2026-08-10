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
  COOKING_ABILITY_LABELS,
  DIETARY_PATTERN_LABELS,
  EAT_OUT_LABELS,
  GOAL_LABELS,
  INTOLERANCE_LABELS,
  SCREENING_LABELS,
  SCREENING_REASON_COPY,
  SLOT_LABELS,
  TRAINING_LABELS,
  UNIT_LABELS,
  WORK_SCHEDULE_LABELS,
} from "@/lib/content/labels";
import {
  COOKING_ABILITIES,
  DIETARY_PATTERNS,
  EAT_OUT_FREQUENCIES,
  INTOLERANCES,
  TRAINING_FREQUENCIES,
  WORK_SCHEDULES,
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

const SETUP_STEPS = [
  { id: "basics", label: "Basics" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "food", label: "Food" },
  { id: "practical", label: "Practical constraints" },
  { id: "household", label: "Household" },
  { id: "preferences", label: "Preferences" },
  { id: "safety", label: "Safety and review" },
] as const;

type SetupStepId = (typeof SETUP_STEPS)[number]["id"];

type WizardStepId = "welcome" | SetupStepId | "done" | "refused";

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function IntakeWizard({ initialName }: { initialName?: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<"welcome" | "setup" | "done" | "refused">("welcome");
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
  const variants = wizardSlideVariants(!!reduceMotion);

  const step: { id: WizardStepId; label: string } =
    mode === "welcome"
      ? { id: "welcome", label: "Welcome" }
      : mode === "done"
        ? { id: "done", label: "Complete" }
        : mode === "refused"
          ? { id: "refused", label: "Unable to proceed" }
          : SETUP_STEPS[stepIndex];

  useEffect(() => {
    document.getElementById(headingId)?.focus();
  }, [mode, stepIndex, headingId]);

  function patch(partial: Partial<IntakeDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function validate(current: SetupStepId): boolean {
    const next: Record<string, string> = {};
    if (current === "basics") {
      if (!draft.displayName.trim()) next.displayName = "Enter your name.";
      if (draft.age < 16 || draft.age > 100) next.age = "Enter an age between 16 and 100.";
      if (draft.heightCm < 120 || draft.heightCm > 230)
        next.heightCm = "Enter height between 120 and 230 cm.";
      if (draft.weightKg < 35 || draft.weightKg > 300)
        next.weightKg = "Enter weight between 35 and 300 kg.";
    }
    if (current === "safety") {
      if (!draft.consentHealthData) next.consent = "Consent is required to create your plan.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (mode === "welcome") {
      setMode("setup");
      return;
    }
    if (mode !== "setup") return;
    const current = SETUP_STEPS[stepIndex].id;
    if (!validate(current)) return;
    if (current === "safety") {
      void submit();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, SETUP_STEPS.length - 1));
  }

  function goBack() {
    setSubmitError(null);
    if (mode === "setup" && stepIndex === 0) {
      setMode("welcome");
      return;
    }
    if (mode === "setup") {
      setStepIndex((i) => Math.max(i - 1, 0));
    }
  }

  async function submit() {
    if (submitted.current || submitting) return;
    if (!validate("safety")) return;
    submitted.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setMode("done");

    const payload = {
      age: draft.age,
      heightCm: draft.heightCm,
      weightKg: draft.weightKg,
      sex: draft.sex,
      goal: draft.goal,
      unitSystem: draft.unitSystem,
      activityLevel: draft.lifestyle.activityLevel,
      declaredAllergens: draft.declaredAllergens,
      excludedSlots: draft.excludedSlots,
      swapRequests: draft.swapRequests,
      screeningFlags: draft.screeningFlags,
      lifestyle: draft.lifestyle,
      foodPreferences: draft.foodPreferences,
      practical: draft.practical,
      household: draft.household,
      notesForCoach: draft.notesForCoach || undefined,
      displayName: draft.displayName.trim() || undefined,
      consentHealthData: true as const,
      marketingOptIn: draft.marketingOptIn,
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
        router.push("/?next=/portal/intake");
        return;
      }
      if (res.status === 403) {
        setSubmitError("Your account does not include the personal nutrition plan yet.");
        submitted.current = false;
        setSubmitting(false);
        setMode("setup");
        setStepIndex(SETUP_STEPS.length - 1);
        return;
      }
      if (!res.ok) {
        setSubmitError("The plan could not be created. Check your answers and try again.");
        submitted.current = false;
        setSubmitting(false);
        setMode("setup");
        setStepIndex(SETUP_STEPS.length - 1);
        return;
      }

      if (data.outcome === "refused") {
        setResultNotice(
          (data.reasonCodes ?? []).map(
            (code) => SCREENING_REASON_COPY[code] ?? "A plan could not be generated.",
          ),
        );
        setSubmitting(false);
        setMode("refused");
        return;
      }

      setSubmitting(false);
      router.push("/portal/setup/preview");
      router.refresh();
    } catch {
      setSubmitError("Network error. Try again when you are online.");
      submitted.current = false;
      setSubmitting(false);
      setMode("setup");
      setStepIndex(SETUP_STEPS.length - 1);
    }
  }

  const showFooter =
    mode === "setup" || (mode === "welcome");

  return (
    <OnboardingShell
      footer={
        showFooter ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {mode === "setup" ? (
              <Button variant="quiet" onClick={goBack}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={goNext} loading={submitting} disabled={submitting}>
              {mode === "setup" && SETUP_STEPS[stepIndex].id === "safety"
                ? "Create my plan"
                : "Continue"}
            </Button>
          </div>
        ) : null
      }
    >
      {mode === "setup" ? (
        <OnboardingProgress
          step={stepIndex + 1}
          total={SETUP_STEPS.length}
          label={SETUP_STEPS[stepIndex].label}
        />
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${stepIndex}`}
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
                  We will use your answers to build your personal nutrition plan.
                  Health data stays in your account and is used only for your plan.
                </Status>
              </>
            ) : null}

            {step.id === "basics" ? (
              <fieldset className="space-y-4">
                <legend className="sr-only">Basics</legend>
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
                <MeasurementInput
                  label="Height (cm)"
                  name="heightCm"
                  type="number"
                  inputMode="decimal"
                  value={draft.heightCm}
                  onChange={(e) => patch({ heightCm: Number(e.target.value) })}
                  error={errors.heightCm}
                />
                <MeasurementInput
                  label="Current weight (kg)"
                  name="weightKg"
                  type="number"
                  inputMode="decimal"
                  value={draft.weightKg}
                  onChange={(e) => patch({ weightKg: Number(e.target.value) })}
                  error={errors.weightKg}
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
                <div className="space-y-2">
                  <p className="text-body text-foreground">Goal</p>
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
                </div>
              </fieldset>
            ) : null}

            {step.id === "lifestyle" ? (
              <fieldset className="space-y-4">
                <legend className="sr-only">Lifestyle</legend>
                <div className="space-y-2">
                  <p className="text-body text-foreground">Activity level</p>
                  {(
                    Object.keys(ACTIVITY_LABELS) as Array<keyof typeof ACTIVITY_LABELS>
                  ).map((level) => (
                    <OptionCard
                      key={level}
                      name="activity"
                      value={level}
                      title={ACTIVITY_LABELS[level]}
                      selected={draft.lifestyle.activityLevel === level}
                      onSelect={() =>
                        patch({
                          lifestyle: { ...draft.lifestyle, activityLevel: level },
                          activityLevel: level,
                        })
                      }
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-body text-foreground">Training frequency</p>
                  {TRAINING_FREQUENCIES.map((freq) => (
                    <OptionCard
                      key={freq}
                      name="training"
                      value={freq}
                      title={TRAINING_LABELS[freq]}
                      selected={draft.lifestyle.trainingFrequency === freq}
                      onSelect={() =>
                        patch({
                          lifestyle: { ...draft.lifestyle, trainingFrequency: freq },
                        })
                      }
                    />
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <MeasurementInput
                    label="Typical wake time"
                    name="wakeTime"
                    type="time"
                    value={draft.lifestyle.wakeTime ?? ""}
                    onChange={(e) =>
                      patch({
                        lifestyle: { ...draft.lifestyle, wakeTime: e.target.value },
                      })
                    }
                  />
                  <MeasurementInput
                    label="Typical sleep time"
                    name="sleepTime"
                    type="time"
                    value={draft.lifestyle.sleepTime ?? ""}
                    onChange={(e) =>
                      patch({
                        lifestyle: { ...draft.lifestyle, sleepTime: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-body text-foreground">Work schedule</p>
                  {WORK_SCHEDULES.map((sched) => (
                    <OptionCard
                      key={sched}
                      name="workSchedule"
                      value={sched}
                      title={WORK_SCHEDULE_LABELS[sched]}
                      selected={draft.lifestyle.workSchedule === sched}
                      onSelect={() =>
                        patch({
                          lifestyle: { ...draft.lifestyle, workSchedule: sched },
                        })
                      }
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step.id === "food" ? (
              <fieldset className="space-y-4">
                <legend className="sr-only">Food</legend>
                <MeasurementInput
                  label="Foods you like (optional)"
                  name="likes"
                  value={draft.foodPreferences.likes ?? ""}
                  onChange={(e) =>
                    patch({
                      foodPreferences: {
                        ...draft.foodPreferences,
                        likes: e.target.value,
                      },
                    })
                  }
                  hint="Stored for your coach. Not used to decide safety exclusions."
                />
                <MeasurementInput
                  label="Foods you dislike (optional)"
                  name="dislikes"
                  value={draft.foodPreferences.dislikes ?? ""}
                  onChange={(e) =>
                    patch({
                      foodPreferences: {
                        ...draft.foodPreferences,
                        dislikes: e.target.value,
                      },
                    })
                  }
                />
                <div className="space-y-3">
                  <p className="text-body text-foreground">Allergies</p>
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
                </div>
                <div className="space-y-3">
                  <p className="text-body text-foreground">Intolerances</p>
                  {INTOLERANCES.map((item) => (
                    <Checkbox
                      key={item}
                      id={`intolerance-${item}`}
                      label={INTOLERANCE_LABELS[item]}
                      checked={draft.foodPreferences.intolerances.includes(item)}
                      onCheckedChange={() =>
                        patch({
                          foodPreferences: {
                            ...draft.foodPreferences,
                            intolerances: toggleIn(
                              draft.foodPreferences.intolerances,
                              item,
                            ),
                          },
                        })
                      }
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-body text-foreground">Dietary pattern</p>
                  {DIETARY_PATTERNS.map((pattern) => (
                    <OptionCard
                      key={pattern}
                      name="dietaryPattern"
                      value={pattern}
                      title={DIETARY_PATTERN_LABELS[pattern]}
                      selected={draft.foodPreferences.dietaryPattern === pattern}
                      onSelect={() =>
                        patch({
                          foodPreferences: {
                            ...draft.foodPreferences,
                            dietaryPattern: pattern,
                          },
                        })
                      }
                    />
                  ))}
                </div>
                <MeasurementInput
                  label="Foods you refuse to eat (optional)"
                  name="refusedFoods"
                  value={draft.foodPreferences.refusedFoods ?? ""}
                  onChange={(e) =>
                    patch({
                      foodPreferences: {
                        ...draft.foodPreferences,
                        refusedFoods: e.target.value,
                      },
                    })
                  }
                />
                <div className="space-y-3">
                  <p className="text-body text-foreground">
                    Foods you prefer to replace in your plan
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
                </div>
              </fieldset>
            ) : null}

            {step.id === "practical" ? (
              <fieldset className="space-y-4">
                <legend className="sr-only">Practical constraints</legend>
                <MeasurementInput
                  label="Weekly food budget (€, optional)"
                  name="budget"
                  type="number"
                  inputMode="numeric"
                  value={draft.practical.weeklyBudgetEur ?? ""}
                  onChange={(e) =>
                    patch({
                      practical: {
                        ...draft.practical,
                        weeklyBudgetEur: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
                <div className="space-y-2">
                  <p className="text-body text-foreground">Cooking ability</p>
                  {COOKING_ABILITIES.map((level) => (
                    <OptionCard
                      key={level}
                      name="cookingAbility"
                      value={level}
                      title={COOKING_ABILITY_LABELS[level]}
                      selected={draft.practical.cookingAbility === level}
                      onSelect={() =>
                        patch({
                          practical: { ...draft.practical, cookingAbility: level },
                        })
                      }
                    />
                  ))}
                </div>
                <Checkbox
                  id="kitchen"
                  label="I have a kitchen available for cooking"
                  checked={draft.practical.kitchenAvailable}
                  onCheckedChange={(checked) =>
                    patch({
                      practical: { ...draft.practical, kitchenAvailable: checked },
                    })
                  }
                />
                <MeasurementInput
                  label="Time available for cooking (minutes per day)"
                  name="cookingTime"
                  type="number"
                  inputMode="numeric"
                  value={draft.practical.cookingTimeMinutes}
                  onChange={(e) =>
                    patch({
                      practical: {
                        ...draft.practical,
                        cookingTimeMinutes: Number(e.target.value),
                      },
                    })
                  }
                />
                <div className="space-y-2">
                  <p className="text-body text-foreground">How often you eat out</p>
                  {EAT_OUT_FREQUENCIES.map((freq) => (
                    <OptionCard
                      key={freq}
                      name="eatOut"
                      value={freq}
                      title={EAT_OUT_LABELS[freq]}
                      selected={draft.practical.eatOutFrequency === freq}
                      onSelect={() =>
                        patch({
                          practical: { ...draft.practical, eatOutFrequency: freq },
                        })
                      }
                    />
                  ))}
                </div>
                <MeasurementInput
                  label="Country or region (optional)"
                  name="country"
                  value={draft.practical.countryRegion ?? ""}
                  onChange={(e) =>
                    patch({
                      practical: {
                        ...draft.practical,
                        countryRegion: e.target.value,
                      },
                    })
                  }
                />
              </fieldset>
            ) : null}

            {step.id === "household" ? (
              <fieldset className="space-y-3">
                <legend className="text-body text-foreground">
                  Who are you cooking for?
                </legend>
                <Checkbox
                  id="self"
                  label="Myself"
                  checked={draft.household.cookingForSelf}
                  onCheckedChange={(checked) =>
                    patch({
                      household: { ...draft.household, cookingForSelf: checked },
                    })
                  }
                />
                <Checkbox
                  id="partner"
                  label="Partner"
                  checked={draft.household.cookingForPartner}
                  onCheckedChange={(checked) =>
                    patch({
                      household: { ...draft.household, cookingForPartner: checked },
                    })
                  }
                />
                <Checkbox
                  id="family"
                  label="Family"
                  checked={draft.household.cookingForFamily}
                  onCheckedChange={(checked) =>
                    patch({
                      household: { ...draft.household, cookingForFamily: checked },
                    })
                  }
                />
              </fieldset>
            ) : null}

            {step.id === "preferences" ? (
              <fieldset className="space-y-2">
                <legend className="sr-only">Measurement preferences</legend>
                {(["HOUSEHOLD", "METRIC", "SIMPLE"] as const).map((unit) => (
                  <OptionCard
                    key={unit}
                    name="unit"
                    value={unit}
                    title={UNIT_LABELS[unit]}
                    selected={draft.unitSystem === unit}
                    onSelect={() => patch({ unitSystem: unit })}
                  />
                ))}
              </fieldset>
            ) : null}

            {step.id === "safety" ? (
              <div className="space-y-tight">
                <Status role="neutral">
                  <p className="font-meta text-foreground">Important</p>
                  <p className="mt-1">
                    These circumstances materially change whether this product is
                    appropriate. If you indicate something requiring professional
                    oversight, we will explain the limitation rather than adjust
                    your plan silently.
                  </p>
                </Status>
                <fieldset className="space-y-3">
                  <legend className="text-body text-foreground">
                    Health and safety context
                  </legend>
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
                <div className="border-t border-hairline pt-4">
                  <ReviewGroup title="Basics" onEdit={() => setStepIndex(0)}>
                    <p>
                      {draft.displayName}, {draft.age} years, {draft.weightKg} kg ·{" "}
                      {GOAL_LABELS[draft.goal]}
                    </p>
                  </ReviewGroup>
                  <ReviewGroup title="Food" onEdit={() => setStepIndex(2)}>
                    <p>
                      {DIETARY_PATTERN_LABELS[draft.foodPreferences.dietaryPattern]}
                      {draft.declaredAllergens.length
                        ? ` · Allergies: ${draft.declaredAllergens.map((a) => ALLERGEN_LABELS[a]).join(", ")}`
                        : ""}
                    </p>
                  </ReviewGroup>
                </div>
                <div className="space-y-3">
                  <Checkbox
                    id="consent"
                    label="I consent to processing of my health data to create my plan."
                    checked={draft.consentHealthData}
                    onCheckedChange={(checked) =>
                      patch({ consentHealthData: checked })
                    }
                  />
                  <Checkbox
                    id="marketing"
                    label="Send me the weekly shopping list by email."
                    checked={draft.marketingOptIn}
                    onCheckedChange={(checked) =>
                      patch({ marketingOptIn: checked })
                    }
                  />
                </div>
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
              <Status role="neutral">Creating your plan…</Status>
            ) : null}

            {step.id === "refused" ? (
              <div className="space-y-tight">
                <Status role="neutral">
                  <p className="font-meta text-foreground">
                    This product cannot generate a plan for your current answers
                  </p>
                  {resultNotice?.map((line) => (
                    <p key={line} className="mt-2">
                      {line}
                    </p>
                  ))}
                  <p className="mt-3">
                    Please speak with a qualified clinician or dietitian for
                    personalised guidance.
                  </p>
                </Status>
                <Button
                  variant="quiet"
                  onClick={() => {
                    submitted.current = false;
                    setMode("setup");
                    setStepIndex(SETUP_STEPS.length - 1);
                  }}
                >
                  Review your answers
                </Button>
              </div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </OnboardingShell>
  );
}

function headingFor(id: WizardStepId): string {
  switch (id) {
    case "welcome":
      return "Complete your personal setup";
    case "basics":
      return "Basics";
    case "lifestyle":
      return "Lifestyle";
    case "food":
      return "Food";
    case "practical":
      return "Practical constraints";
    case "household":
      return "Household";
    case "preferences":
      return "Preferences";
    case "safety":
      return "Safety and review";
    case "done":
      return "Building your plan";
    case "refused":
      return "Unable to create a plan";
  }
}

function whyFor(id: WizardStepId): string {
  switch (id) {
    case "welcome":
      return "About ten minutes. You can go back and edit any section before your plan is created.";
    case "basics":
      return "Your starting point for a plan matched to your body and goal.";
    case "lifestyle":
      return "Activity and schedule shape your energy needs and meal timing.";
    case "food":
      return "Allergies remove foods completely. Other preferences guide your plan where possible.";
    case "practical":
      return "Budget, time, and kitchen access keep your plan realistic.";
    case "household":
      return "Who you cook for affects portions and shopping.";
    case "preferences":
      return "Choose how amounts are shown in your plan and shopping list.";
    case "safety":
      return "Review everything once, then confirm to generate your plan.";
    case "done":
      return "We are generating your personal plan from your answers.";
    case "refused":
      return "Your safety answers mean a plan cannot be generated in this product.";
  }
}
