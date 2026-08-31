import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const baseField =
  "w-full rounded-lg border border-ink-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 " +
  "transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-ink-100";

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
          {error && <span className="ml-1 text-xs font-normal text-red-600">— {error}</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn(baseField, invalid && "border-red-400 focus:border-red-500 focus:ring-red-500/20", className)}
      {...props}
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(baseField, "resize-y", invalid && "border-red-400", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(baseField, "cursor-pointer appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  );
}
