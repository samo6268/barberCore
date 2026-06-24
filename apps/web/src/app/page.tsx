import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
          style={{ background: 'var(--color-background)' }}>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
          بارِبِرکُر
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
          پلتفرم رزرو آنلاین آرایشگاه و سالن زیبایی
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/male"
          className="px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
          style={{ background: '#1e3a5f' }}
        >
          آرایشگاه مردانه
        </Link>
        <Link
          href="/female"
          className="px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
          style={{ background: '#7c2d52' }}
        >
          سالن زنانه
        </Link>
      </div>
    </main>
  );
}
