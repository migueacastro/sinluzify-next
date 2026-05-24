import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "./lib/supabase";
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string
        });

        if (error || !data.session) {
          return null;
        }

        const supabaseUser = data.user;
        const supabaseSession = data.session;

        return {
          id: supabaseUser.id,
          name: supabaseUser.email?.split("@")[0] || "Usuario",
          email: supabaseUser.email,
          accessToken: supabaseSession.access_token,
          refreshToken: supabaseSession.refresh_token
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.expiresAt = (user as any).expiresAt;
        return token;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = token.expiresAt as number | undefined;

      if (!expiresAt || now + 10 < expiresAt) {
        return token;
      }

      try {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: token.refreshToken as string
        });

        if (error || !data.session) {
          return null;
        }

        token.accessToken = data.session.access_token;
        token.refreshToken = data.session.refresh_token;
        token.expiresAt = data.session.expires_at;
        return token;
      } catch (error) {
        console.error("Error refresing token:, ", error);
        return null;
      }
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login"
  },
  session: {
    strategy: "jwt"
  }
});
