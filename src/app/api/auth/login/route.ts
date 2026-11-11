import { NextResponse } from "next/server";
import {
  authenticateDemoUser,
  createDemoSession,
  getRoleRedirectPath,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    const user = authenticateDemoUser(
      String(email).toLowerCase().trim(),
      String(password),
    );
    if (!user)
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    await createDemoSession(user);
    return NextResponse.json({
      user,
      redirectTo: getRoleRedirectPath(user.role),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal login. Coba lagi." }, { status: 500 });
  }
}
