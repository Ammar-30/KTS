import { redirect } from "next/navigation";
import { getSession } from "@lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
    // Check if user is already logged in
    const session = await getSession();

    if (session) {
        // Redirect to appropriate dashboard based on role
        const target =
            session.role === "EMPLOYEE"
                ? "/employee"
                : session.role === "MANAGER"
                    ? "/manager"
                    : session.role === "TRANSPORT"
                        ? "/transport"
                        : "/admin";

        redirect(target);
    }

    return <LoginForm />;
}
