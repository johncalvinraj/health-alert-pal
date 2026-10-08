import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { saveUser } from "@/lib/prescriptions";

export function SiteHeader() {
  const cls = "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground";
  const active = { className: "bg-secondary text-secondary-foreground" };
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const valid = /^\S+@\S+\.\S+$/.test(email) && password.length >= 6;

  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
      <Link to="/" className="font-display text-2xl font-semibold text-primary">Dose.</Link>
      <nav className="flex flex-wrap items-center gap-1">
        <Link to="/" className={cls} activeProps={active} activeOptions={{ exact: true }}>Active alerts</Link>
        <Link to="/alerts" className={cls} activeProps={active}>Alerts</Link>
        <Link to="/prescriptions" className={cls} activeProps={active}>Prescriptions</Link>
        <Link to="/lifestyle" className={cls} activeProps={active}>Lifestyle</Link>
        <button
          onClick={() => setOpen(true)}
          className="ml-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Sign up
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              saveUser(email.trim());
              setOpen(false);
              navigate({ to: "/lifestyle" });
            }}
            className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 shadow-xl"
          >
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <input
              type="email" required placeholder="you@gmail.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full border py-3 font-semibold">Cancel</button>
              <button disabled={!valid} className="flex-1 rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">Sign up</button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
