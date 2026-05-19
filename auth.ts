import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
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
                    return null
                }

                const { data, error } = await supabase.auth.signInWithPassword({
                    email: credentials.email as string,
                    password: credentials.password as string
                })

                if (error || !data.session) {
                    return null
                }

                const supabaseUser = data.user
                const supabaseSession = data.session


                return {
                    id: supabaseUser.id,
                    name: supabaseUser.email?.split("@")[0] || "Usuario",
                    email: supabaseUser.email,
                    accessToken: supabaseSession.access_token,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken
            }
            return token
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken
            return session
        }
    },
    pages: {
        signIn: "/auth/login"
    },
    session: {
        strategy: "jwt"
    }
})