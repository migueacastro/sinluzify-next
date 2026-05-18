import { useRouter } from "next/router";
import { SubmitEvent } from "react";

export default function LoginPage() {
    const router = useRouter()

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget as HTMLFormElement);
        const email = formData.get("email")
        const password = formData.get("password")

        const response = await fetch("/api/auth/login", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            router.push("/profile")
        } else {

        }
    }

    return (
        <form onSubmit={handleSubmit}>

            <input type="email" name="email" id="email" placeholder="Email" required />
            <input type="password" name="password" id="password" placeholder="Password" />
            <button type="submit">Login</button>
        </form>
    )
}