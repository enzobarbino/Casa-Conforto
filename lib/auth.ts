import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export interface SessionData {
  isAdmin?: boolean;
  email?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "casa-e-conforto-super-segredo-de-sessao-32-chars-minimo",
  cookieName: "casa_conforto_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/painel/login");
  }
  return session;
}

// Hash de fallback para admin123 (usado quando ADMIN_PASSWORD_HASH não está no .env
// ou quando o dotenv interpreta incorretamente o $ do hash bcrypt)
const FALLBACK_HASH =
  "$2b$10$OPzJ2Pf6oJ1irPoByNm2R.0wsIQEg7LgUgO1MKTWyCqom1ArMPuNO";

export async function loginAdmin(
  email: string,
  senhaPlana: string
): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@casaeconforto.local";
  // Usa o hash do .env se tiver 60 chars (hash bcrypt válido), caso contrário usa o fallback
  const envHash = process.env.ADMIN_PASSWORD_HASH || "";
  const adminHash = envHash.length === 60 ? envHash : FALLBACK_HASH;

  if (!email || !senhaPlana) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }

  if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }

  const senhaValida = bcrypt.compareSync(senhaPlana, adminHash);
  if (!senhaValida) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }

  const session = await getSession();
  session.isAdmin = true;
  session.email = adminEmail;
  await session.save();

  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/painel/login");
}

