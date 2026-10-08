import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Medication alert — Dose" },
      { name: "description", content: "Time to take your medicine: mark it taken or snooze for later." },
      { property: "og:title", content: "Medication alert — Dose" },
      { property: "og:description", content: "Time to take your medicine: mark it taken or snooze for later." },
    ],
  }),
  component: AlertPage,
});

function AlertPage() {
  const [status, setStatus] = useState<"pending" | "taken" | "later">("pending");
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center">
        <span className="mb-6 h-4 w-4 animate-pulse rounded-full bg-warning" />
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Time for your medicine</p>
        <div className="mt-6 w-full rounded-3xl border bg-card p-10 shadow-lg">
          <h1 className="text-5xl font-semibold">Penicillin</h1>
          <p className="mt-4 text-muted-foreground">Dosage</p>
          <p className="font-display text-4xl font-semibold text-primary">5 mg</p>
          {status === "pending" ? (
            <div className="mt-8 flex gap-3">
              <button onClick={() => setStatus("later")} className="flex-1 rounded-full border py-3 font-semibold">Later</button>
              <button onClick={() => setStatus("taken")} className="flex-1 rounded-full bg-primary py-3 font-semibold text-primary-foreground">Taken</button>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              <p className="font-semibold">{status === "taken" ? "Marked as taken. Well done!" : "We'll remind you again later."}</p>
              <button onClick={() => setStatus("pending")} className="text-sm text-muted-foreground underline">Undo</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
