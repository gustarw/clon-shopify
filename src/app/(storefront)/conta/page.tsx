import { redirect } from "next/navigation";

export default function ContaRedirect() {
  redirect("/login");
}
