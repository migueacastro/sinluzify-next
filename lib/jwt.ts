import { jwtVerify } from "jose";

const SUPABASE_JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || ""
);

export async function verifySupabaseToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SUPABASE_JWT_SECRET, {
            algorithms: ["HS256"] // Supabase usa HS256 por defecto
        });
        return payload;
    } catch (error) {
        return null; // Token manipulado, expirado o firma incorrecta
    }
}