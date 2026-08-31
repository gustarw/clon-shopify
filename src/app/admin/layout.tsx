export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-theme min-h-screen bg-[#f7f7f7] text-[#222222] font-sans antialiased selection:bg-[#ff385c]/20 selection:text-[#ff385c]">
      {children}
    </div>
  );
}
