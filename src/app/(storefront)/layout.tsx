import { getThemeConfig } from "@/lib/repo/theme";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StorefrontThemeStyles } from "@/components/storefront/StorefrontThemeStyles";

export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = getThemeConfig();

  return (
    <StorefrontThemeStyles theme={theme}>
      <Header theme={theme} />
      <main className="flex-1">{children}</main>
      <Footer theme={theme} />
      <CartDrawer />
    </StorefrontThemeStyles>
  );
}
