import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Shell({ children, className }: Props) {
  return (
    <div className={twMerge("mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-8", className)}>
      {children}
    </div>
  );
}
