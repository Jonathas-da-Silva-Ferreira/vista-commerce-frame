import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// `cn` merges Tailwind classes while respecting the design system's
// precedence rules — twMerge dedupes conflicting utilities (e.g. `p-2 p-4`)
// so callers can layer base + override classes without surprises.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatter centralized here so the whole storefront speaks a single
// locale/currency. Using Intl.NumberFormat (not a hand-rolled formatter)
// guarantees correct grouping, symbol position, and rounding per locale.
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
