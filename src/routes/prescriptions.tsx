import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { usePrescriptions } from "@/lib/prescriptions";

export const Route = createFileRoute("/prescriptions")({
  head: () => ({
    meta: [
      { title: "Add a prescription — Dose" },
      { name: "description", content: "Add a prescription by photo, manual entry, or prescription number." },
      { property: "og:title", content: "Add a prescription — Dose" },
      { property: "og:description", content: "Add a prescription by photo, manual entry, or prescription number." },
    ],
  }),
  component: PrescriptionsPage,
});

type Mode = "image" | "manual" | "number";
const field = "w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

function PrescriptionsPage() {
  const { items, add, remove } = usePrescriptions();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", dosage: "", frequency: "", time: "", reference: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const canSubmit =
    mode === "image" ? !!file : mode === "number" ? f.reference.trim() !== "" : f.name.trim() !== "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    add({
      source: mode,
      name: f.name || (mode === "image" ? `Prescription photo` : `Rx #${f.reference}`),
      dosage: f.dosage,
      frequency: f.frequency,
      time: f.time,
      ...(f.reference ? { reference: f.reference } : {}),
      ...(file ? { imageName: file.name } : {}),
    });
    navigate({ to: "/" });
  };

  const tabs: { id: Mode; label: string }[] = [
    { id: "image", label: "Upload image" },
    { id: "manual", label: "Enter manually" },
    { id: "number", label: "Prescription number" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 md:grid-cols-[1.4fr_1fr]">
        <section>
          <h1 className="py-6 text-5xl font-semibold">Add a prescription</h1>
          <div className="mb-6 flex flex-wrap gap-2 rounded-full bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === t.id ? "bg-card text-foreground shadow" : "text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6">
            {mode === "image" && (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted p-8 text-center">
                {preview ? (
                  <img src={preview} alt="Prescription preview" className="max-h-56 rounded-lg" />
                ) : (
                  <>
                    <span className="font-display text-xl">Drop or choose a photo</span>
                    <span className="text-sm text-muted-foreground">JPG or PNG of your prescription</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFile(file);
                    setPreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
              </label>
            )}

            {mode === "number" && (
              <div>
                <label className="mb-1 block text-sm font-semibold">Prescription number</label>
                <input className={field} inputMode="numeric" placeholder="e.g. 4820193" value={f.reference} onChange={set("reference")} />
              </div>
            )}

            {mode === "manual" && (
              <div>
                <label className="mb-1 block text-sm font-semibold">Medication name</label>
                <input className={field} placeholder="e.g. Amoxicillin" value={f.name} onChange={set("name")} />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold">Dosage</label>
                <input className={field} placeholder="500 mg" value={f.dosage} onChange={set("dosage")} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Frequency</label>
                <select className={field} value={f.frequency} onChange={set("frequency")}>
                  <option value="">Select</option>
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>As needed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Alert time</label>
                <input type="time" className={field} value={f.time} onChange={set("time")} />
              </div>
            </div>

            <button
              disabled={!canSubmit}
              className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              Save prescription
            </button>
          </form>
        </section>

        <aside className="md:pt-28">
          <h2 className="mb-4 text-2xl font-semibold">Your prescriptions</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground">None added yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.source === "image" ? "From photo" : p.source === "number" ? "From number" : "Manual"}
                      {p.time && ` · ${p.time}`}
                    </p>
                  </div>
                  <button onClick={() => remove(p.id)} className="text-sm text-destructive hover:underline">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}
