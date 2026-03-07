import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return <input className={`w-full rounded-lg border border-slate-300 px-3 py-2 ${className}`} {...props} />;
}
