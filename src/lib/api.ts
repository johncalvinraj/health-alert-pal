import type { Meal, Prescription, Slot } from "@/lib/prescriptions";

/** Base URL of the Medicare API. Set VITE_API_URL in .env.local to override. */
const BASE = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:8081/api";

/** A prescription as the API sends it. The API uses uppercase enums, numeric ids and ISO dates. */
type ApiPrescription = {
  id: number;
  name: string;
  dosage: string;
  slot: "MORNING" | "EVENING" | "NIGHT" | null;
  meal: "BEFORE" | "AFTER";
  courseDays: number | null;
  createdAt: string;
};

export type NewPrescription = Omit<Prescription, "id" | "createdAt">;

/** An error response from the API, or status 0 when the server couldn't be reached. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(0, "Could not reach the server");
  }
  if (!res.ok) {
    // Errors are RFC 9457 problem details: { detail, errors?: { field: message } }
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? res.statusText, body.errors ?? {});
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

// The API only stores manually entered prescriptions, so everything it returns is "manual".
const fromApi = (p: ApiPrescription): Prescription => ({
  id: String(p.id),
  name: p.name,
  dosage: p.dosage,
  ...(p.slot ? { slot: p.slot.toLowerCase() as Slot } : {}),
  meal: p.meal.toLowerCase() as Meal,
  source: "manual",
  ...(p.courseDays ? { courseDays: p.courseDays } : {}),
  createdAt: Date.parse(p.createdAt),
});

/** All prescriptions, newest first. */
export async function listPrescriptions(): Promise<Prescription[]> {
  return (await request<ApiPrescription[]>("/prescriptions")).map(fromApi);
}

export async function createPrescription(p: NewPrescription): Promise<Prescription> {
  const saved = await request<ApiPrescription>("/prescriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: p.name,
      dosage: p.dosage,
      slot: p.slot?.toUpperCase() ?? null,
      meal: p.meal?.toUpperCase() ?? null,
      courseDays: p.courseDays ?? null,
    }),
  });
  return fromApi(saved);
}

export async function deletePrescription(id: string): Promise<void> {
  await request<void>(`/prescriptions/${encodeURIComponent(id)}`, { method: "DELETE" });
}
