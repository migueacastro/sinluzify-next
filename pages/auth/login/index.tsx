import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { SubmitEvent } from "react";

export default function LoginPage() {
    const router = useRouter()

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget as HTMLFormElement);
        const email = formData.get("email")
        const password = formData.get("password")

        const result = await signIn("credentials", {
            redirect: false,
            email,
            password
        });

        if (result.ok && !result.error) {
            router.push("/profile")
        } else {
            alert("Credenciales incorrectas")
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '50px auto' }}>
            <input type="email" name="email" id="email" placeholder="Email" required />
            <input type="password" name="password" id="password" placeholder="Password" required />
            <button type="submit">Iniciar Sesión</button>
        </form>
    )
}
