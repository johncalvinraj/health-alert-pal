import { createFileRoute, useBlocker, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { readLifestyle, saveLifestyle, type Lifestyle } from "@/lib/prescriptions";

export const Route = createFileRoute("/lifestyle")({
  head: () => ({
    meta: [
      { title: "Your daily routine — Dose" },
      { name: "description", content: "Tell us when you eat so your medicine reminders match your day." },
      { property: "og:title", content: "Your daily routine — Dose" },
      { property: "og:description", content: "Tell us when you eat so your medicine reminders match your day." },
    ],
  }),
  component: LifestylePage,
});

const field = "w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

function LifestylePage() {
  const [l, setL] = useState<Lifestyle>({ breakfast: "", lunch: "", dinner: "" });
  const [warn, setWarn] = useState(false);
  const done = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    const saved = readLifestyle();
    if (saved) setL(saved);
  }, []);
  const complete = !!(l.breakfast && l.lunch && l.dinner);

  useBlocker({
    shouldBlockFn: () => {
      if (done.current) return false;
      setWarn(true);
      return true;
    },
    enableBeforeUnload: () => !done.current,
  });

  const meals: { k: keyof Lifestyle; label: string }[] = [
    { k: "breakfast", label: "Breakfast" },
    { k: "lunch", label: "Lunch" },
    { k: "dinner", label: "Dinner" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 pb-20">
        <h1 className="py-6 text-5xl font-semibold">Your daily routine</h1>
        <p className="mb-6 text-muted-foreground">When do you usually eat? We'll time your reminders around your meals.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!complete) return setWarn(true);
            saveLifestyle(l);
            done.current = true;
            navigate({ to: "/" });
          }}
          className="space-y-4 rounded-2xl border bg-card p-6"
        >
          {meals.map((m) => (
            <div key={m.k}>
              <label className="mb-1 block text-sm font-semibold">{m.label} time</label>
              <input type="time" required className={field} value={l[m.k]} onChange={(e) => setL({ ...l, [m.k]: e.target.value })} />
            </div>
          ))}
          {warn && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
              Please fill in all meal times and press Continue before leaving this page.
            </p>
          )}
          <button disabled={!complete} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">
            Continue
          </button>
        </form>
      </main>
    </div>
  );
}
