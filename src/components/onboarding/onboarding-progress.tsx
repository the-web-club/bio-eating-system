import { ProgressLine } from "@/components/portal/progress-line";

export function OnboardingProgress({
  step,
  total,
}: {
  step: number;
  total: number;
  label: string;
}) {
  return (
    <div className="mb-s5">
      <ProgressLine
        value={step}
        max={total}
        label={`Step ${step} of ${total}`}
        reading={`${step} / ${total}`}
      />
    </div>
  );
}
