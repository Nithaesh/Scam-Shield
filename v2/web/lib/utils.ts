import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Defangs a URL or domain so it cannot be clicked accidentally.
 * Example: https://sbi-kyc.com -> hxxps[://]sbi-kyc[.]com or sbi-kyc[.]com
 */
export function defangUrl(url: string): string {
  if (!url) return "";
  return url
    .replace(/^https?:\/\//i, (m) => (m.toLowerCase().startsWith("https") ? "hxxps://" : "hxxp://"))
    .replace(/\./g, "[.]")
    .replace(/:\/\//g, "[://]");
}

/**
 * Defangs an email or UPI handle for safe display.
 */
export function defangHandle(handle: string): string {
  if (!handle) return "";
  return handle.replace(/@/g, "[at]").replace(/\./g, "[.]");
}
