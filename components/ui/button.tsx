import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl border text-sm font-medium transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    primary:
      "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 " +
      "focus-visible:ring-slate-900",
    ghost:
      "border-slate-300 bg-white text-slate-900 hover:bg-slate-50 " +
      "focus-visible:ring-slate-400",
  } as const;

  return <button className={`${base} ${variants[variant]} px-4 py-2 ${className}`} {...props} />;
}
