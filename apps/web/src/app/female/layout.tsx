export default function MaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-gender="female" className="min-h-screen">
      {children}
    </div>
  );
}
