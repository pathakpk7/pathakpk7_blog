import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { authConfig } from "./auth.config";
import { z } from "zod";

const ADMIN_EMAIL = "prasoon7pathak@gmail.com";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const cleanEmail = email.toLowerCase().trim();

        const user = await db.user.findFirst({
          where: {
            email: {
              equals: cleanEmail,
              mode: "insensitive",
            },
          },
          include: { profile: true },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        const role = cleanEmail === ADMIN_EMAIL ? "ADMIN" : user.role;
        const username = user.profile?.username || cleanEmail.split("@")[0].replace(/[^a-z0-9_.]/g, "");

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName ?? user.name ?? "User",
          image: user.profile?.avatarUrl ?? user.image,
          role,
          username,
        };
      },
    }),
  ],
});

