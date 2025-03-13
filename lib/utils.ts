import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toBoolean(value: unknown): boolean {
  let strValue = String(value).toLowerCase();
  strValue = ((!isNaN(Number(strValue)) && strValue !== '0') &&
    strValue !== '' &&
    strValue !== 'null' &&
    strValue !== 'undefined') ? '1' : strValue;
  return strValue === 'true' || strValue === '1' ? true : false
};

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE!) ?? 12582912; // 12 MB