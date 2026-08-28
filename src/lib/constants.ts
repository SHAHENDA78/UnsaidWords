import { Heart, HandHeart, Star, CloudRain, LucideIcon } from "lucide-react";
import { FeelingType } from "./types";

export const FEELING_CONFIG: Record<FeelingType, { label: string; icon: LucideIcon; colorVar: string }> = {
  gratitude: { label: "Gratitude", icon: Heart, colorVar: "gratitude" },
  apology: { label: "Apology", icon: HandHeart, colorVar: "apology" },
  admiration: { label: "Admiration", icon: Star, colorVar: "admiration" },
  annoyance: { label: "Frustration", icon: CloudRain, colorVar: "annoyance" },
};

export function isFollowUpDue(followUpAt?: string | null, followUpStatus?: string | null): boolean {
  if (!followUpAt || followUpStatus) return false;
  return new Date(followUpAt) <= new Date();
}

export function hashPin(pin: string): string {
  return btoa(pin.split("").reverse().join("") + "_uw_salt");
}

export function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}