import { useEffect, useState } from "react";

export type Prescription = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  source: "image" | "manual" | "number";
  reference?: string;
  imageName?: string;
  createdAt: number;
};

const KEY = "prescriptions";

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
