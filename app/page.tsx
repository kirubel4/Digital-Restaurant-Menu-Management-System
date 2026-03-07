import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-center text-4xl font-black text-slate-900">Digital Restaurant Menu & Management System</h1>
      <p className="text-center text-slate-600">Select a role dashboard to continue.</p>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <Link className="rounded-xl bg-slate-900 px-4 py-4 text-center font-semibold text-white" href="/manager">
          Manager
        </Link>
        <Link className="rounded-xl bg-blue-700 px-4 py-4 text-center font-semibold text-white" href="/waiter">
          Waiter
        </Link>
        <Link className="rounded-xl bg-emerald-700 px-4 py-4 text-center font-semibold text-white" href="/chef">
          Chef
        </Link>
        <Link className="rounded-xl bg-amber-600 px-4 py-4 text-center font-semibold text-white" href="/cashier">
          Cashier
        </Link>
      </div>
    </main>
  );
}
