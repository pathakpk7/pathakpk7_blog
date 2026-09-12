import type { NextAuthConfig } from "next-auth";

const ADMIN_EMAIL = "prasoon7pathak@gmail.com";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const email = auth?.user?.email?.toLowerCase();
      const role = (auth?.user as any)?.role;
      const isAdmin = role === "ADMIN" || email === ADMIN_EMAIL;
      const { pathname } = nextUrl;

      // Studio routes -> Single Admin only
      if (pathname.startsWith("/studio")) {
        if (!isLoggedIn) {
          return false; // Redirects to pages.signIn
        }
        if (!isAdmin) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Library & Settings -> Authenticated users
      if (pathname.startsWith("/library") || pathname.startsWith("/settings")) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const userEmail = (user.email || "").toLowerCase();
        token.role = userEmail === ADMIN_EMAIL ? "ADMIN" : (user as any).role || "USER";
        token.username = (user as any).username;
      }
      if (trigger === "update" && session?.username) {
        token.username = session.username;
      }
      if (token.email?.toLowerCase() === ADMIN_EMAIL) {
        token.role = "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        const userEmail = (session.user.email || token.email || "").toLowerCase();
        (session.user as any).role = userEmail === ADMIN_EMAIL ? "ADMIN" : ((token.role as "USER" | "ADMIN") || "USER");
        (session.user as any).username = (token.username as string) || (session.user.name ? session.user.name.toLowerCase().replace(/\s+/g, "_") : "reader");
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs (e.g. / or /settings)
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        // Allows same origin or vercel deployment domains
        if (urlObj.origin === baseUrlObj.origin || urlObj.host.includes("vercel.app") || urlObj.host.includes("localhost")) {
          return url;
        }
      } catch {}
      return baseUrl;
    },
  },
  providers: [], // Configured with Prisma in auth.ts
} satisfies NextAuthConfig;

