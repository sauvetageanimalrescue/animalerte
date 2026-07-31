import { setRequestLocale } from "next-intl/server";
import { FormReset } from "@/components/form-reset";

export default async function MotDePasseOubliePage({
  params,
}: PageProps<"/[locale]/mot-de-passe-oublie">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FormReset />;
}
