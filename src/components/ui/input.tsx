import type { ReactNode } from "react";
import { Field, type FieldProps } from "./field";

export type TextFieldProps = FieldProps;

/** @deprecated Use Field. Kept as an alias during migration. */
export function TextField(props: TextFieldProps) {
  return <Field {...props} />;
}

/** @deprecated Renamed to Field. */
export const UnderlineInput = TextField;

export { Field };
