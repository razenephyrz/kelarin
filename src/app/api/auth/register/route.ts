import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { audit } from "@/lib/server";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, address, nik } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
    if (String(password).length < 6)
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    const em = String(email).toLowerCase().trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    const existing = await db.select().from(users).where(eq(users.email, em)).limit(1);
    if (existing[0]) return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 409 });
    const hash = await hashPassword(String(password));
    const [row] = await db
      .insert(users)
      .values({ name: String(name).slice(0, 160), email: em, passwordHash: hash, role: "WARGA", phone: phone ?? null, address: address ?? null, nik: nik ?? null })
      .returning();
    await createSession(row.id);
    await audit({ actorId: row.id, action: "REGISTER", entity: "users", entityId: row.id, details: { email: em } });
    const { passwordHash, ...safe } = row as any;
    return NextResponse.json({ user: safe });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal mendaftar." }, { status: 500 });
  }
}
