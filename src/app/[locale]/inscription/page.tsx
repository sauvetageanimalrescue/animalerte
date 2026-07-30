import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";

export default async function InscriptionPage({
  params,
}: PageProps<"/[locale]/inscription">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthForm mode="inscription" />;
}
