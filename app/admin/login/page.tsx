import { redirect } from "next/navigation";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin/auth";
import { SignIn } from "../SignIn";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (isAdminAuthenticated()) redirect("/admin");
  return <SignIn configured={adminConfigured()} />;
}

