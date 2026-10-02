import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Acceso Profesional | Hospital Veterinario & UCI",
  description: "Portal de acceso para médicos veterinarios, cirujanos, anestesistas y personal administrativo.",
};

export default function LoginPage() {
  return <LoginForm />;
}
