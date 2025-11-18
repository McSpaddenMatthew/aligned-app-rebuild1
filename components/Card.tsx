import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: Props) {
  return (
    <div className={twMerge("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}
