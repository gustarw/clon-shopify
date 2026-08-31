import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Criar conta | SensaShop" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/conta");
  }

  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
