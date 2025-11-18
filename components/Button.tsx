import { ButtonHTMLAttributes, ReactElement, isValidElement, cloneElement } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  asChild?: boolean;
}

export function Button({
  className,
  children,
  variant = "primary",
  asChild = false,
  ...props
}: Props) {
  const base = "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition";
  const variants: Record<typeof variant, string> = {
    primary: "bg-accentOrange text-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg",
    secondary: "bg-lightGray text-primaryBlack hover:bg-slate-100",
    ghost: "text-primaryBlack hover:bg-lightGray",
  };

  const merged = twMerge(base, variants[variant], "disabled:opacity-60", className);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement, {
      className: twMerge(merged, (children.props as { className?: string }).className),
    });
  }

  return (
    <button className={merged} {...props}>
      {children}
    </button>
  );
}
