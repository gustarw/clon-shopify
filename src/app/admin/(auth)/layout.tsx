import Link from "next/link";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f7f7f7] text-[#222222] font-sans antialiased">
      {/* Header */}
      <header className="h-20 border-b border-[#ebebeb] bg-[#ffffff] px-6 sm:px-10 flex items-center justify-between">
        <Link href="/admin/login" className="flex items-center gap-3 group">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#ff385c] text-white shadow-sm transition-transform group-hover:scale-105">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#222222]">
              SensaShop
            </span>
            <span className="bg-[#f7f7f7] text-[#222222] border border-[#ebebeb] text-[11px] font-semibold px-2 py-0.5 rounded-full tracking-wide">
              Admin Portal
            </span>
          </div>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors"
        >
          <span>Ir para a loja</span>
          <span>↗</span>
        </Link>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[440px] animate-fade-up">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#6a6a6a] border-t border-[#ebebeb] bg-[#ffffff]">
        <p>© {new Date().getFullYear()} SensaShop Admin. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
