import { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={twMerge(
        "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-accentOrange",
        className
      )}
      {...props}
    />
  );
}
