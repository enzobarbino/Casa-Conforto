"use server";

import { loginAdmin, logoutAdmin } from "@/lib/auth";

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;

  const result = await loginAdmin(email, senha);
  if (!result.success) {
    return { error: result.error || "E-mail ou senha incorretos." };
  }

  return { success: true };
}

export async function logoutAction() {
  await logoutAdmin();
}

