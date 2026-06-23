"use client";

import type { User } from "./types";

const STORAGE_KEY = "wordroom_user";
const PENDING_INVITE_KEY = "wordroom_pending_invite";

export interface StoredUser {
  id: string;
  full_name: string;
}

export function saveCurrentUser(user: User | StoredUser): void {
  if (typeof window === "undefined") return;
  const payload: StoredUser = { id: user.id, full_name: user.full_name };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredUser;
    if (parsed && parsed.id && parsed.full_name) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function savePendingInvite(code: string): void {
  if (typeof window === "undefined") return;
  const normalized = code.trim().toUpperCase();
  if (!normalized) return;
  localStorage.setItem(PENDING_INVITE_KEY, normalized);
}

export function getPendingInvite(): string | null {
  if (typeof window === "undefined") return null;
  const code = localStorage.getItem(PENDING_INVITE_KEY)?.trim().toUpperCase();
  return code || null;
}

export function clearPendingInvite(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_INVITE_KEY);
}
