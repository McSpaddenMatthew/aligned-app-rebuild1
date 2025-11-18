import { TextareaHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...props }: Props) {
  return (
    <textarea
      className={twMerge(
        "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-accentOrange",
        className
      )}
      {...props}
    />
  );
}
