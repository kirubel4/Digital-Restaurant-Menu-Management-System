import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
      <h1 className="text-2xl font-bold">404 - Page not found</h1>
      <Link href="/" className="rounded bg-sky-600 px-4 py-2 text-white">Go home</Link>
    </main>
  );
}
