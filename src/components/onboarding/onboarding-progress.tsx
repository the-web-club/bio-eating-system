import { ProgressLine } from "@/components/portal/progress-line";

export function OnboardingProgress({
  step,
  total,
  label,
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
        label={label}
        reading={`Step ${step} of ${total}`}
      />
    </div>
  );
}
