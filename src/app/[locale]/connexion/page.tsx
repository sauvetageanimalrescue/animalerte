import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";

export default async function ConnexionPage({
  params,
}: PageProps<"/[locale]/connexion">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthForm mode="connexion" />;
}
