import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useEffect, useState } from "react";
import { usePrescriptions, readLifestyle, alarmTime, type Lifestyle } from "@/lib/prescriptions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dose — Your medication alerts" },
      { name: "description", content: "See your active medication alerts at a glance." },
      { property: "og:title", content: "Dose — Your medication alerts" },
      { property: "og:description", content: "See your active medication alerts at a glance." },
    ],
  }),
  component: Home,
});

function Home() {
  const { items } = usePrescriptions();
  const [life, setLife] = useState<Lifestyle | null>(null);
  useEffect(() => setLife(readLifestyle()), []);
  const sorted = items
    .map((p) => ({ ...p, at: alarmTime(p, life) }))
    .sort((a, b) => (a.at ?? "99").localeCompare(b.at ?? "99"));
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Today</p>
            <h1 className="mt-2 text-5xl font-semibold leading-tight md:text-6xl">Active alerts</h1>
            <p className="mt-3 max-w-md text-muted-foreground">Every dose you need to take, in one calm place.</p>
          </div>
          <Link
            to="/prescriptions"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
          >
            + Add prescription
          </Link>
        </section>

        {!life && (
          <div className="mb-6 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
            Add your meal times on the{" "}
            <Link to="/lifestyle" className="font-semibold underline">Lifestyle page</Link> so we can set your alarm times.
          </div>
        )}
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <h2 className="text-2xl font-semibold">No active alerts</h2>
            <p className="mt-2 text-muted-foreground">Add a prescription to start receiving reminders.</p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {sorted.map((p) => (
              <li key={p.id} className="flex items-center gap-5 rounded-2xl border bg-card p-5">
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <span className="font-display text-lg font-semibold">{p.at ?? "--:--"}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p.dosage ? `Take ${p.dosage}` : "Dosage not set"}
                    {p.meal && ` · ${p.meal} food`}
                  </p>
                </div>
                <span className="ml-auto h-3 w-3 shrink-0 animate-pulse rounded-full bg-warning" />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
