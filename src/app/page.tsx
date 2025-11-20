import { redirect } from "next/navigation";

export default function Home() {
  // Redirect / -> /login
  redirect("/login");
}
