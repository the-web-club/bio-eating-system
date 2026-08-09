import { Eyebrow } from "@/components/portal/layout";
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
    <div className="mb-group space-y-2.5">
      <Eyebrow>{label}</Eyebrow>
      <ProgressLine
        value={step}
        max={total}
        label={`Step ${step} of ${total}`}
        reading={`${step}/${total}`}
      />
    </div>
  );
}
