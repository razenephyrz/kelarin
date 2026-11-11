"use client";
import { parseJsonResponse } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type Me = { id: string; name: string; email: string; role: string; phone?: string | null; address?: string | null };

export function useMe(allowed?: string[]) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        const j = await parseJsonResponse(r);
        if (!r.ok || !j.user) {
          router.push("/login");
          return;
        }
        if (allowed && !allowed.includes(j.user.role)) {
          setErr(`Halaman ini membutuhkan role ${allowed.join("/")} (Anda: ${j.user.role}).`);
        }
        setMe(j.user);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);
  return { me, loading, err };
}
