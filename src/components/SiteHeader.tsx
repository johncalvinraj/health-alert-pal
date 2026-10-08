import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  const cls = "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground";
  const active = { className: "bg-secondary text-secondary-foreground" };
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
      <Link to="/" className="font-display text-2xl font-semibold text-primary">Dose.</Link>
      <nav className="flex gap-1">
        <Link to="/" className={cls} activeProps={active} activeOptions={{ exact: true }}>Home</Link>
        <Link to="/prescriptions" className={cls} activeProps={active}>Prescriptions</Link>
      </nav>
    </header>
  );
}
