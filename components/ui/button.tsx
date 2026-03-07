import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className = "", ...props }: ButtonProps) {
  return <button className={`rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white ${className}`} {...props} />;
}
