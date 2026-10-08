import { useEffect, useState } from "react";

export type Slot = "morning" | "evening" | "night";
export type Meal = "before" | "after";

export type Prescription = {
  id: string;
  name: string;
  dosage: string;
  slot?: Slot;
  meal?: Meal;
  source: "image" | "manual" | "number";
  reference?: string;
  imageName?: string;
  createdAt: number;
};

export type Lifestyle = { breakfast: string; lunch: string; dinner: string };

const KEY = "prescriptions";
const LIFE = "lifestyle";
const USER = "user";

function read(): Prescription[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function usePrescriptions() {
  const [items, setItems] = useState<Prescription[]>([]);
  useEffect(() => setItems(read()), []);
  const save = (next: Prescription[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
  };
  return {
    items,
    add: (p: Omit<Prescription, "id" | "createdAt">) =>
      save([{ ...p, id: crypto.randomUUID(), createdAt: Date.now() }, ...read()]),
    remove: (id: string) => save(read().filter((p) => p.id !== id)),
  };
}

export function readLifestyle(): Lifestyle | null {
  try {
    return JSON.parse(localStorage.getItem(LIFE) || "null");
  } catch {
    return null;
  }
}
export const saveLifestyle = (l: Lifestyle) => localStorage.setItem(LIFE, JSON.stringify(l));
export const saveUser = (email: string) => localStorage.setItem(USER, JSON.stringify({ email }));

const slotMeal: Record<Slot, keyof Lifestyle> = { morning: "breakfast", evening: "lunch", night: "dinner" };

/** Meal time minus 10 min if before food, plus 10 min if after food. */
export function alarmTime(p: Prescription, l: Lifestyle | null): string | null {
  if (!p.slot || !p.meal || !l) return null;
  const base = l[slotMeal[p.slot]];
  if (!base) return null;
  const [h, m] = base.split(":").map(Number);
  const total = (h * 60 + m + (p.meal === "before" ? -10 : 10) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
