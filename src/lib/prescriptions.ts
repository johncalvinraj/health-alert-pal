import { useEffect, useState } from "react";
import {
  ApiError,
  createPrescription,
  deletePrescription,
  listPrescriptions,
  type NewPrescription,
} from "@/lib/api";

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
  calendarEventId?: string;
  /** Length of the course in days, counting the day it was added. Unset = lifetime. */
  courseDays?: number;
  createdAt: number;
};

export type Lifestyle = { breakfast: string; lunch: string; dinner: string };

// Prescriptions live in the Medicare API. KEY holds a copy of the last list it returned, so code
// outside components (calendar sync) can read it without waiting for a request.
const KEY = "prescriptions.api";
// Google Calendar event ids stay in the browser (prescription id -> event id).
const CAL = "calendarEvents";
const LIFE = "lifestyle";
const USER = "user";

function readCalendarIds(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(CAL) || "{}");
  } catch {
    return {};
  }
}

function setCalendarId(id: string, eventId: string | undefined) {
  const ids = readCalendarIds();
  if (eventId) ids[id] = eventId;
  else delete ids[id];
  sessionStorage.setItem(CAL, JSON.stringify(ids));
}

const writeCache = (list: Prescription[]) => sessionStorage.setItem(KEY, JSON.stringify(list));

export function readPrescriptions(): Prescription[] {
  try {
    const ids = readCalendarIds();
    const list: Prescription[] = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    return list.map((p) => {
      const eventId = ids[p.id];
      return eventId ? { ...p, calendarEventId: eventId } : p;
    });
  } catch {
    return [];
  }
}

export function usePrescriptions() {
  const [items, setItems] = useState<Prescription[]>([]);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    setItems(readPrescriptions());
    listPrescriptions()
      .then((list) => {
        writeCache(list);
        setItems(readPrescriptions());
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, []);
  return {
    items,
    /** True when the API couldn't be reached; items then show the last list loaded. */
    loadError,
    /** Saves to the API. Throws ApiError if it's rejected or the server is unreachable. */
    add: async (p: NewPrescription) => {
      const saved = await createPrescription(p);
      writeCache([saved, ...readPrescriptions()]);
      setItems(readPrescriptions());
    },
    /** Deletes from the API. Already deleted (404) counts as success. */
    remove: async (id: string) => {
      await deletePrescription(id).catch((e) => {
        if (!(e instanceof ApiError && e.status === 404)) throw e;
      });
      setCalendarId(id, undefined);
      writeCache(readPrescriptions().filter((p) => p.id !== id));
      setItems(readPrescriptions());
    },
    /** Only the Google Calendar link can change; it's stored in this browser. */
    update: (id: string, patch: Pick<Prescription, "calendarEventId">) => {
      setCalendarId(id, patch.calendarEventId);
      setItems(readPrescriptions());
    },
  };
}

export function readLifestyle(): Lifestyle | null {
  try {
    return JSON.parse(sessionStorage.getItem(LIFE) || "null");
  } catch {
    return null;
  }
}
export const saveLifestyle = (l: Lifestyle) => sessionStorage.setItem(LIFE, JSON.stringify(l));
export type User = { email: string; autoCalendar?: boolean };
export function readUser(): User | null {
  try {
    return JSON.parse(sessionStorage.getItem(USER) || "null");
  } catch {
    return null;
  }
}
export const saveUser = (email: string, autoCalendar = false) =>
  sessionStorage.setItem(USER, JSON.stringify({ email, autoCalendar }));
export const setAutoCalendar = (on: boolean) => {
  const u = readUser();
  if (u) saveUser(u.email, on);
};

/** Storage-level update, for code outside a component (e.g. calendar sync). */
export const patchPrescription = (id: string, patch: Pick<Prescription, "calendarEventId">) =>
  setCalendarId(id, patch.calendarEventId);

const slotMeal: Record<Slot, keyof Lifestyle> = {
  morning: "breakfast",
  evening: "lunch",
  night: "dinner",
};

/** Meal time minus 10 min if before food, plus 10 min if after food. */
export function alarmTime(p: Prescription, l: Lifestyle | null): string | null {
  if (!p.slot || !p.meal || !l) return null;
  const base = l[slotMeal[p.slot]];
  if (!base) return null;
  const [h = 0, m = 0] = base.split(":").map(Number);
  const total = (h * 60 + m + (p.meal === "before" ? -10 : 10) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Last moment of the course's final day (local time), or null for lifetime. */
export function courseEnd(p: Prescription): Date | null {
  if (!p.courseDays) return null;
  const end = startOfDay(new Date(p.createdAt));
  end.setDate(end.getDate() + p.courseDays);
  return new Date(end.getTime() - 1);
}

/** Lifetime prescriptions are always active; courses until the end of their last day. */
export const isActive = (p: Prescription, now = new Date()) => {
  const end = courseEnd(p);
  return !end || now <= end;
};

/** Days left including today (1 = last day), or null for lifetime. */
export function daysLeft(p: Prescription, now = new Date()): number | null {
  const end = courseEnd(p);
  if (!end) return null;
  return Math.max(0, Math.round((startOfDay(end).getTime() - startOfDay(now).getTime()) / DAY) + 1);
}
