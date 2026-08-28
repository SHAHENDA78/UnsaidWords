export type FeelingType = "gratitude" | "apology" | "admiration" | "annoyance";

export interface Feeling {
  id: string;
  type: FeelingType;
  personName: string;
  content: string;
  createdAt: string;
  followUpAt?: string | null;
  followUpStatus?: "still_feeling" | "changed" | "said_it" | null;
}