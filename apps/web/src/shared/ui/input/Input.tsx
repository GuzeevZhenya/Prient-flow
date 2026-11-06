import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className = "", ...rest },
  ref,
) {
  const border = invalid
    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
    : "border-slate-300 focus:border-slate-500 focus:ring-slate-200";
  return (
    <input
      ref={ref}
      className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${border} ${className}`}
      {...rest}
    />
  );
});
