import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signToken, verifyToken } from "./lib/jwt";
import { supabase } from "./lib/supabase";
export const { handlers, signIn, signOut, auth } = NextAuth({
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
    jwt: {
        // Sobrescribimos el encode/decode de NextAuth para que use tu jose
        encode: async ({ token }) => {
            return await signToken(token);
        },
        decode: async ({ token }) => {
            return await verifyToken(token as string) as any;
        }
    },
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt"
    }
})