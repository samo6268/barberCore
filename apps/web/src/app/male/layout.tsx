export default function MaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-gender="male" className="min-h-screen">
      {children}
    </div>
  );
}
