import type { InputHTMLAttributes } from "react";
import { Field } from "@/components/ui/field";

export function MeasurementInput({
  label,
  hint,
  error,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      className={className}
      {...rest}
    />
  );
}
